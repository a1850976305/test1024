/*
@header({
  searchable: 2,
  filterable: 0,
  quickSearch: 0,
  title: '永乐视频',
  '类型': '影视',
  lang: 'ds'
})
*/

var rule = {
    类型: '影视',
    title: '永乐视频',
    desc: '永乐视频资源站',
    host: 'https://www.ylys.tv',
    url: '/vodtype/fypage/',
    searchUrl: '/vodsearch/-------------.html?wd=',
    searchable: 2,
    quickSearch: 0,
    filterable: 0,
    filter_url: '{{fl.cateId}}',
    filter: {},
    filter_def: {},
    headers: {
        'User-Agent': 'MOBILE_UA',
        'Referer': 'https://www.ylys.tv/'
    },
    class_name:'电影&剧集&综艺&动漫',
    class_url:'1&2&3&4',
    play_parse: true,
    limit: 6,
    double: false,
    
    预处理: async () => {
        return [];
    },
    
    推荐: async function (tid, pg, filter, extend) {
        let {input, pdfa, pdfh, pd} = this;
        let html = await request(input);
        let d = [];
        let data = pdfa(html, '.module-items .module-item');
        data.forEach((it) => {
            let title = pdfh(it, '.module-poster-item-title&&Text');
            let url = pd(it, 'a&&href');
            let pic_url = pd(it, '.module-item-pic img.lazyload&&data-original');
            if (pic_url && !pic_url.startsWith('http')) {
                pic_url = this.host + pic_url;
            }
            let desc = pdfh(it, '.module-item-note&&Text');
            d.push({
                title: title,
                pic_url: pic_url,
                desc: desc,
                url: url
            });
        });
        return setResult(d);
    },
    
    一级: async function (tid, pg, filter, extend) {
        let {input, pdfa, pdfh, pd} = this;
        let html = await request(input);
        let d = [];
        let data = pdfa(html, '.module-items .module-item');
        data.forEach((it) => {
            let title = pdfh(it, '.module-poster-item-title&&Text');
            let url = pd(it, 'a&&href');
            let pic_url = pd(it, '.module-item-pic img.lazyload&&data-original');
            if (pic_url && !pic_url.startsWith('http')) {
                pic_url = this.host + pic_url;
            }
            let desc = pdfh(it, '.module-item-note&&Text');
            d.push({
                title: title,
                pic_url: pic_url,
                desc: desc,
                url: url
            });
        });
        return setResult(d);
    },
    
    二级: async function (ids) {
        let {input, pdfa, pdfh, pd} = this;
        let html = await request(input);
        let VOD = {};
        
        VOD.vod_name = pdfh(html, '.module-info-heading h1&&Text') || '';
        
        VOD.vod_pic = pd(html, '.module-item-pic img.ls-is-cached.lazy&&data-original') || '';
        if (VOD.vod_pic && !VOD.vod_pic.startsWith('http')) {
            VOD.vod_pic = this.host + VOD.vod_pic;
        }
        
        let detailTexts = pdfa(html, '.module-info-content .module-info-item');
        let descList = [];
        detailTexts.forEach((p) => {
            let text = pdfh(p, 'Text') || '';
            if (text) {
                descList.push(text.trim());
            }
        });
        VOD.vod_remarks = descList.join(' / ');
        
        VOD.vod_content = pdfh(html, '.module-info-introduction-content&&Text') || '';
        
        let tabs = pdfa(html, '.module-tab-item');
        let lists = pdfa(html, '.module-play-list');
        let playmap = {};
        
        tabs.forEach((tab, i) => {
            const form = pdfh(tab, 'Text');
            const list = lists[i];
            if (list) {
                const items = pdfa(list, 'a');
                const playItems = [];
                items.forEach((item) => {
                    let title = pdfh(item, 'Text');
                    let urls = pd(item, 'href', input);
                    if (title && urls) {
                        playItems.push(title + "$" + urls);
                    }
                });
                if (playItems.length > 0) {
                    playmap[form] = playItems;
                }
            }
        });
        
        VOD.vod_play_from = Object.keys(playmap).join('$$$');
        const urls = Object.values(playmap);
        const playUrls = urls.map((urllist) => {
            return urllist.join("#");
        });
        VOD.vod_play_url = playUrls.join('$$$');
        
        return VOD;
    },
    
    搜索: async function (wd, quick, pg) {
        let {input, pdfa, pdfh, pd} = this;
        let html = await request(input);
        let d = [];
        let data = pdfa(html, '.module-items .module-item');
        data.forEach((it) => {
            let title = pdfh(it, '.module-poster-item-title&&Text');
            let url = pd(it, 'a&&href');
            let pic_url = pd(it, '.module-item-pic img.lazyload&&data-original');
            if (pic_url && !pic_url.startsWith('http')) {
                pic_url = this.host + pic_url;
            }
            let desc = pdfh(it, '.module-item-note&&Text');
            d.push({
                title: title,
                pic_url: pic_url,
                desc: desc,
                url: url
            });
        });
        return setResult(d);
    },
    
    lazy: async function (flag, id, flags) {
        let {input, pdfa, pdfh, pd} = this;
        let html = await request(input);
        
        let playerMatch = html.match(/player_aaaa.*?=\s*({.*?})\s*<\/\s*script>/);
        if (playerMatch) {
            try {
                let playerData = JSON.parse(playerMatch[1]);
                let url = playerData.url || '';
                let encrypt = playerData.encrypt || '';
                
                if (encrypt === '1') {
                    url = unescape(url);
                } else if (encrypt === '2') {
                    url = unescape(base64Decode(url));
                }
                
                if (/m3u8|mp4|flv/.test(url)) {
                    return {parse: 0, url: url};
                }
            } catch (e) {
                console.log('解析播放器数据失败: ' + e.message);
            }
        }
        
        let iframeMatch = html.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/);
        if (iframeMatch && iframeMatch[1]) {
            let iframeUrl = iframeMatch[1];
            if (iframeUrl.startsWith('//')) {
                iframeUrl = 'https:' + iframeUrl;
            }
            return {parse: 0, url: iframeUrl};
        }
        
        return {parse: 0, url: input};
    }
};
