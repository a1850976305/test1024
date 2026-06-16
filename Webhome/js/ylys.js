// ==UserScript==
// @name         永乐视频 WebHome 扩展
// @namespace    ylys-webhome
// @version      1.0.0
// @description  为永乐视频注入 App 播放按钮，支持网盘/磁力/直链解析
// @author       WebHome Extension Builder
// @match        https://www.ylys.tv/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const siteKey = 'ylys';
    
    function getCurrentPageType() {
        const url = window.location.href;
        if (url.includes('/voddetail/')) return 'detail';
        if (url.includes('/play/')) return 'play';
        if (url.includes('/vodtype/')) return 'category';
        return 'home';
    }

    function extractVideoInfo() {
        const info = {
            title: '',
            cover: '',
            wallPic: '',
            url: '',
            urls: [],
            type: 'video'
        };

        if (getCurrentPageType() === 'detail') {
            info.title = document.querySelector('h1')?.textContent.trim() || 
                        document.querySelector('.title')?.textContent.trim() || 
                        document.title?.split('-')[0].trim() || '';
            
            const coverMeta = document.querySelector('meta[property="og:image"]');
            info.cover = coverMeta?.getAttribute('content') || '';
            info.wallPic = info.cover;
        }

        return info;
    }

    function parsePlayUrls() {
        const urls = [];
        const scripts = document.querySelectorAll('script');
        
        for (const script of scripts) {
            const content = script.textContent;
            if (content.includes('player_aaaa')) {
                try {
                    const match = content.match(/player_aaaa\s*=\s*(\{.*?\});?/);
                    if (match) {
                        const jsonStr = match[1].replace(/'/g, '"');
                        const playerData = JSON.parse(jsonStr);
                        
                        if (playerData.url) {
                            urls.push({
                                url: playerData.url,
                                type: playerData.url.includes('.m3u8') ? 'm3u8' : 
                                      playerData.url.includes('.mp4') ? 'mp4' : 'other',
                                label: '主线路'
                            });
                        }
                        
                        if (playerData.url_next) {
                            urls.push({
                                url: playerData.url_next,
                                type: playerData.url_next.includes('.m3u8') ? 'm3u8' : 'other',
                                label: '备用线路'
                            });
                        }
                    }
                } catch (e) {
                    console.log('解析播放器配置失败:', e);
                }
            }
        }
        
        return urls;
    }

    function createPlayButton(info) {
        const button = document.createElement('button');
        button.className = 'webhome-play-btn';
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
            </svg>
            <span>App播放</span>
        `;
        
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        `;
        
        button.onmouseenter = () => {
            button.style.transform = 'scale(1.05)';
            button.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.6)';
        };
        
        button.onmouseleave = () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.4)';
        };
        
        button.onclick = () => {
            const playUrls = parsePlayUrls();
            
            if (playUrls.length === 0) {
                const playLink = document.querySelector('a[href*="/play/"]');
                if (playLink) {
                    window.open(playLink.href, '_self');
                    setTimeout(() => {
                        const urls = parsePlayUrls();
                        if (urls.length > 0) {
                            invokePlayer(urls, info);
                        }
                    }, 3000);
                }
                return;
            }
            
            invokePlayer(playUrls, info);
        };
        
        return button;
    }

    function invokePlayer(urls, info) {
        if (typeof fm !== 'undefined' && fm.vodInline) {
            const vodItem = {
                title: info.title || '未知标题',
                pic: info.cover || '',
                wallPic: info.wallPic || info.cover || '',
                url: urls[0].url,
                urls: urls.map(u => ({
                    url: u.url,
                    type: u.type,
                    label: u.label
                })),
                type: 'video'
            };
            
            fm.vodInline(vodItem);
        } else if (typeof window.WebHome !== 'undefined') {
            window.WebHome.playVideo({
                title: info.title || '未知标题',
                url: urls[0].url,
                cover: info.cover || '',
                sources: urls
            });
        } else {
            const videoUrl = urls[0].url;
            if (videoUrl) {
                window.open(videoUrl, '_blank');
            }
        }
    }

    function injectButton() {
        if (getCurrentPageType() !== 'detail') return;
        
        const existingBtn = document.querySelector('.webhome-play-btn');
        if (existingBtn) existingBtn.remove();
        
        const info = extractVideoInfo();
        const button = createPlayButton(info);
        document.body.appendChild(button);
    }

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(injectButton, 1000);
            });
        } else {
            setTimeout(injectButton, 1000);
        }
        
        const observer = new MutationObserver(() => {
            injectButton();
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }

    init();

})();
