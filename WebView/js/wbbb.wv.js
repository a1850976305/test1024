/**
 * @config
 * timeout: 30
 * blockImages: true
 * returnType: dom
 * keyword: Checking your browser|Just a moment|请稍候|访问被拒绝
 * showWebView: false
 */

const baseUrl = 'https://wbbb1.com';
const headers = {
    'Referer': baseUrl,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

function safeText(el) {
    if (!el) return '';
    return (el.textContent || el.innerText || '').replace(/\s+/g, ' ').trim();
}

function fixUrl(url, doc) {
    if (!url) return '';
    if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) return url;
    if (url.indexOf('//') === 0) return 'https:' + url;
    if (doc && typeof doc.fixUrl === 'function') return doc.fixUrl(url);
    return baseUrl.replace(/\/$/, '') + (url.charAt(0) === '/' ? url : '/' + url);
}

function extractList(doc) {
    var items = doc.querySelectorAll('.module-poster-item');
    var list = [];
    for (var i = 0; i < items.length; i++) {
        var el = items[i];
        var link = el.tagName === 'A' ? el : el.querySelector('a');
        var img = el.querySelector('img');
        var vodId = link ? fixUrl(link.getAttribute('href'), doc) : '';
        var vodName = safeText(el.querySelector('.module-poster-item-title')) || 
                      (link ? link.getAttribute('title') : '');
        if (!vodId || !vodName || vodName.length < 1) continue;
        var pic = '';
        if (img) {
            pic = img.getAttribute('data-original') || img.getAttribute('data-src') || img.src || '';
            if (pic && pic.indexOf('errorpic.png') === -1) {
                pic = fixUrl(pic, doc);
            } else {
                pic = '';
            }
        }
        var remark = safeText(el.querySelector('.module-item-note'));
        list.push({
            vod_id: vodId,
            vod_name: vodName,
            vod_pic: pic,
            vod_remarks: remark || ''
        });
    }
    return list;
}

async function homeVideoContent() {
    var res = await fetch(baseUrl + '/', { headers: headers });
    if (res.error || !res.doc) return Result.error(res.error || '请求失败');
    var list = extractList(res.doc);
    list = list.filter(function(item) {
        return item.vod_pic && item.vod_pic.indexOf('errorpic.png') === -1;
    });
    return { list: list };
}

async function homeContent(filter) {
    var commonFilters = [
        { key: 'class_id', name: '剧情', value: [{ n: '全部', v: '' }, { n: '爱情', v: '爱情' }, { n: '言情', v: '言情' }, { n: '都市', v: '都市' }, { n: '家庭', v: '家庭' }, { n: '战争', v: '战争' }, { n: '喜剧', v: '喜剧' }, { n: '古装', v: '古装' }, { n: '武侠', v: '武侠' }, { n: '偶像', v: '偶像' }, { n: '历史', v: '历史' }, { n: '悬疑', v: '悬疑' }, { n: '科幻', v: '科幻' }, { n: '冒险', v: '冒险' }, { n: '惊悚', v: '惊悚' }, { n: '犯罪', v: '犯罪' }, { n: '运动', v: '运动' }, { n: '恐怖', v: '恐怖' }, { n: '剧情', v: '剧情' }, { n: '奇幻', v: '奇幻' }, { n: '纪录片', v: '纪录片' }, { n: '灾难', v: '灾难' }, { n: '动作', v: '动作' }] },
        { key: 'area', name: '地区', value: [{ n: '全部', v: '' }, { n: '大陆', v: '大陆' }, { n: '港台', v: '港台' }, { n: '美国', v: '美国' }, { n: '韩国', v: '韩国' }, { n: '日本', v: '日本' }, { n: '泰国', v: '泰国' }, { n: '印度', v: '印度' }, { n: '法国', v: '法国' }, { n: '英国', v: '英国' }] },
        { key: 'lang', name: '语言', value: [{ n: '全部', v: '' }, { n: '国语', v: '国语' }, { n: '粤语', v: '粤语' }, { n: '韩语', v: '韩语' }, { n: '日语', v: '日语' }, { n: '英语', v: '英语' }, { n: '泰语', v: '泰语' }] },
        { key: 'year', name: '年份', value: [{ n: '全部', v: '' }, { n: '2026', v: '2026' }, { n: '2025', v: '2025' }, { n: '2024', v: '2024' }, { n: '2023', v: '2023' }, { n: '2022', v: '2022' }, { n: '2021', v: '2021' }, { n: '2020', v: '2020' }, { n: '2019', v: '2019' }, { n: '2018', v: '2018' }, { n: '2017', v: '2017' }, { n: '2016', v: '2016' }, { n: '2015', v: '2015' }, { n: '2014', v: '2014' }, { n: '2013', v: '2013' }, { n: '2012', v: '2012' }, { n: '2011', v: '2011' }, { n: '2010', v: '2010' }] },
        { key: 'letter', name: '字母', value: [{ n: '字母', v: '' }, { n: 'A', v: 'A' }, { n: 'B', v: 'B' }, { n: 'C', v: 'C' }, { n: 'D', v: 'D' }, { n: 'E', v: 'E' }, { n: 'F', v: 'F' }, { n: 'G', v: 'G' }, { n: 'H', v: 'H' }, { n: 'I', v: 'I' }, { n: 'J', v: 'J' }, { n: 'K', v: 'K' }, { n: 'L', v: 'L' }, { n: 'M', v: 'M' }, { n: 'N', v: 'N' }, { n: 'O', v: 'O' }, { n: 'P', v: 'P' }, { n: 'Q', v: 'Q' }, { n: 'R', v: 'R' }, { n: 'S', v: 'S' }, { n: 'T', v: 'T' }, { n: 'U', v: 'U' }, { n: 'V', v: 'V' }, { n: 'W', v: 'W' }, { n: 'X', v: 'X' }, { n: 'Y', v: 'Y' }, { n: 'Z', v: 'Z' }, { n: '0-9', v: '0-9' }] }
    ];
    return {
        class: [
            { type_id: '1', type_name: '电影' },
            { type_id: '2', type_name: '剧集' },
            { type_id: '3', type_name: '动漫' },
            { type_id: '4', type_name: '综艺' }
        ],
        filters: {
            '1': commonFilters,
            '2': commonFilters,
            '3': commonFilters,
            '4': commonFilters
        }
    };
}

async function categoryContent(tid, pg, filter, extend) {
    var p = parseInt(pg) || 1;
    var ext = extend || {};
    var url = baseUrl + '/show/' + tid;
    url += '-' + (ext.class_id || '');
    url += '-' + (ext.area || '');
    url += '-' + (ext.lang || '');
    url += '-' + (ext.year || '');
    url += '-' + (ext.letter || '');
    url += '---' + p + '---.html';
    var res = await fetch(url, { headers: headers });
    if (res.error || !res.doc) return Result.error(res.error || '请求失败');
    var list = extractList(res.doc);
    list = list.filter(function(item) {
        return item.vod_pic && item.vod_pic.indexOf('errorpic.png') === -1;
    });
    var pagecount = p;
    var nextLink = res.doc.querySelector('a[href*="---' + (p + 1) + '---.html"]');
    if (nextLink) pagecount = p + 1;
    return { page: p, pagecount: pagecount, list: list, total: list.length };
}

async function detailContent(ids) {
    var id = Array.isArray(ids) ? ids[0] : ids;
    var url = fixUrl(id);
    var res = await fetch(url, { headers: headers });
    if (res.error || !res.doc) return Result.error(res.error || '请求失败');
    var doc = res.doc;
    
    // 标题
    var vodName = safeText(doc.querySelector('h1'));
    if (!vodName) {
        var titleEl = doc.querySelector('.module-poster-item-title');
        if (titleEl) vodName = safeText(titleEl);
    }
    
    // 图片
    var vodPic = '';
    var picEl = doc.querySelector('.module-poster img, .poster img, .cover img');
    if (picEl) {
        vodPic = picEl.getAttribute('data-original') || picEl.getAttribute('data-src') || picEl.src || '';
        vodPic = fixUrl(vodPic, doc);
        if (vodPic.indexOf('errorpic.png') > -1) vodPic = '';
    }
    
    // 简介
    var vodContent = '';
    var contentEl = doc.querySelector('.content');
    if (contentEl) {
        var text = contentEl.textContent || '';
        var match = text.match(/暂无简介，敬请期待|([\s\S]*?)(?:展开全部|收起内容|好影片)/);
        if (match) {
            vodContent = match[1] || match[0] || '';
        }
        vodContent = vodContent.replace(/呼叫医生姜天才[\s\S]*?立即播放/, '').trim();
        vodContent = vodContent.replace(/\s+/g, ' ').trim();
    }
    
    // 提取剧集
    var episodeContainers = doc.querySelectorAll('.module-play-list-content.module-play-list-base');
    var allEpisodes = [];
    for (var ci = 0; ci < episodeContainers.length; ci++) {
        var container = episodeContainers[ci];
        var children = container.children;
        for (var i = 0; i < children.length; i++) {
            var epName = safeText(children[i]);
            if (epName && epName.match(/第\d+集/)) {
                allEpisodes.push(epName);
            }
        }
    }
    if (allEpisodes.length === 0) {
        var containers2 = doc.querySelectorAll('.module-play-list-content');
        for (var cj = 0; cj < containers2.length; cj++) {
            var container2 = containers2[cj];
            var text = container2.textContent || '';
            var matches = text.match(/第\d+集/g);
            if (matches) {
                for (var mi = 0; mi < matches.length; mi++) {
                    if (allEpisodes.indexOf(matches[mi]) === -1) {
                        allEpisodes.push(matches[mi]);
                    }
                }
            }
        }
    }
    
    // 提取线路
    var lineNames = [];
    var tabLinks = doc.querySelectorAll('.play-tab a, .tab a, .menu-tab a');
    tabLinks.forEach(function(el) {
        var name = safeText(el);
        if (name) {
            var cleanName = name.replace(/\d+$/, '').trim();
            if (cleanName && lineNames.indexOf(cleanName) === -1) {
                lineNames.push(cleanName);
            }
        }
    });
    if (lineNames.length === 0) {
        lineNames = ['蓝光C', '蓝光B', 'BF有广'];
    }
    
    // 构建播放数据
    var playFrom = '';
    var playUrl = '';
    var match2 = url.match(/\/detail\/(\d+)\.html/);
    var vodIdNum = match2 ? match2[1] : '';
    
    if (allEpisodes.length > 0) {
        var containerCount = episodeContainers.length;
        if (containerCount > 1 && containerCount === lineNames.length) {
            var froms = [], urls = [];
            for (var k = 0; k < containerCount; k++) {
                var container3 = episodeContainers[k];
                var children2 = container3.children;
                var eps = [];
                for (var m = 0; m < children2.length; m++) {
                    var epName2 = safeText(children2[m]);
                    if (epName2 && epName2.match(/第\d+集/)) {
                        var epMatch = epName2.match(/第(\d+)集/);
                        var epNum = epMatch ? epMatch[1] : (m + 1);
                        var playUrl2 = baseUrl + '/play/' + vodIdNum + '-' + (k + 1) + '-' + epNum + '/';
                        eps.push(epName2 + '$' + playUrl2);
                    }
                }
                if (eps.length > 0) {
                    froms.push(lineNames[k] || ('线路' + (k + 1)));
                    urls.push(eps.join('#'));
                }
            }
            playFrom = froms.join('$$$');
            playUrl = urls.join('$$$');
        } else {
            var eps2 = [];
            for (var n = 0; n < allEpisodes.length; n++) {
                var epName3 = allEpisodes[n];
                var epMatch2 = epName3.match(/第(\d+)集/);
                var epNum2 = epMatch2 ? epMatch2[1] : (n + 1);
                var playUrl3 = baseUrl + '/play/' + vodIdNum + '-1-' + epNum2 + '/';
                eps2.push(epName3 + '$' + playUrl3);
            }
            playFrom = lineNames[0] || '在线播放';
            playUrl = eps2.join('#');
        }
    } else {
        playFrom = '在线播放';
        playUrl = '第1集$' + url;
    }
    
    return {
        list: [{
            vod_id: id,
            vod_name: vodName || '未知标题',
            vod_pic: vodPic,
            vod_content: vodContent || '',
            vod_play_from: playFrom,
            vod_play_url: playUrl
        }]
    };
}

async function searchContent(key, quick, pg) {
    var p = parseInt(pg) || 1;
    var url = baseUrl + '/search/' + encodeURIComponent(key) + '-------------.html';
    if (p > 1) url += '?page=' + p;
    var res = await fetch(url, { headers: headers });
    if (res.error || !res.doc) return Result.error(res.error || '请求失败');
    var list = extractList(res.doc);
    list = list.filter(function(item) {
        return item.vod_pic && item.vod_pic.indexOf('errorpic.png') === -1;
    });
    var pagecount = p;
    var nextLink = res.doc.querySelector('a[href*="page=' + (p + 1) + '"]');
    if (nextLink) pagecount = p + 1;
    return { page: p, pagecount: pagecount, list: list, total: list.length };
}

async function playerContent(flag, id, vipFlags) {
    if (id.indexOf('http') === 0) {
        if (id.indexOf('.m3u8') > 0 || id.indexOf('.mp4') > 0 || id.indexOf('.flv') > 0) {
            return { parse: 0, url: id, header: headers };
        }
        return { parse: 1, url: id, header: headers };
    }
    var url = fixUrl(id);
    return { parse: 1, url: url, header: headers };
}

var routes = {
    homeVideoContent: function () { return false; },
    homeContent: function () { return false; },
    categoryContent: function () { return false; },
    detailContent: function () { return false; },
    searchContent: function () { return false; },
    playerContent: function () { return false; }
};