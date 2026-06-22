/**
 * @config
 * timeout: 30
 * blockImages: true
 * returnType: dom
 * keyword: Checking your browser|Just a moment|请稍候|访问被拒绝
 * showWebView: false
 */

const baseUrl = 'https://www.ylys.tv';
const headers = {
    'Referer': baseUrl,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// 辅助函数
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

// ============ 通用列表提取 ============
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
        
        if (!vodId || !vodName) continue;
        // 跳过"电影榜"等导航项
        if (vodName.indexOf('榜') > -1 && vodName.length <= 4) continue;
        
        var pic = '';
        if (img) {
            pic = img.getAttribute('data-original') || 
                  img.getAttribute('data-src') || 
                  img.src || '';
            // 过滤掉 loading 占位图
            if (pic && pic.indexOf('loading.png') === -1) {
                pic = fixUrl(pic, doc);
            } else {
                pic = '';
            }
        }
        
        // 角标：第X集、已完结、即将上映等
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

// ============ 1. 首页推荐 ============
async function homeVideoContent() {
    var res = await fetch(baseUrl + '/', { headers: headers });
    if (res.error || !res.doc) return Result.error(res.error || '请求失败');
    var list = extractList(res.doc);
    list = list.filter(function(item) {
        return item.vod_pic && item.vod_pic.indexOf('loading.png') === -1;
    });
    return { list: list };
}

// ============ 2. 分类与筛选 ============
async function homeContent(filter) {
    // 通用筛选项（适用于所有分类）
    var commonFilters = [
        {
            key: 'class_id',
            name: '分类',
            value: [
                { n: '全部', v: '' },
                { n: '电影', v: '1' },
                { n: '剧集', v: '2' },
                { n: '综艺', v: '3' },
                { n: '动漫', v: '4' }
            ]
        },
        {
            key: 'area',
            name: '地区',
            value: [
                { n: '全部', v: '' },
                { n: '大陆', v: '大陆' },
                { n: '香港', v: '香港' },
                { n: '台湾', v: '台湾' },
                { n: '日本', v: '日本' },
                { n: '韩国', v: '韩国' },
                { n: '欧美', v: '欧美' },
                { n: '英国', v: '英国' },
                { n: '泰国', v: '泰国' },
                { n: '其它', v: '其它' }
            ]
        },
        {
            key: 'lang',
            name: '语言',
            value: [
                { n: '全部', v: '' },
                { n: '国语', v: '国语' },
                { n: '英语', v: '英语' },
                { n: '粤语', v: '粤语' },
                { n: '韩语', v: '韩语' },
                { n: '日语', v: '日语' },
                { n: '西班牙', v: '西班牙' },
                { n: '法语', v: '法语' },
                { n: '德语', v: '德语' },
                { n: '意大利语', v: '意大利语' },
                { n: '泰语', v: '泰语' },
                { n: '其它', v: '其它' }
            ]
        },
        {
            key: 'year',
            name: '年份',
            value: [
                { n: '全部', v: '' },
                { n: '2026', v: '2026' },
                { n: '2025', v: '2025' },
                { n: '2024', v: '2024' },
                { n: '2023', v: '2023' },
                { n: '2022', v: '2022' },
                { n: '2021', v: '2021' },
                { n: '2020', v: '2020' },
                { n: '2019', v: '2019' },
                { n: '2018', v: '2018' },
                { n: '2017', v: '2017' },
                { n: '2016', v: '2016' },
                { n: '2015', v: '2015' },
                { n: '2014', v: '2014' },
                { n: '2013', v: '2013' },
                { n: '2012', v: '2012' },
                { n: '2011', v: '2011' },
                { n: '更早', v: '更早' }
            ]
        },
        {
            key: 'letter',
            name: '字母',
            value: [
                { n: '字母', v: '' },
                { n: 'A', v: 'A' },
                { n: 'B', v: 'B' },
                { n: 'C', v: 'C' },
                { n: 'D', v: 'D' },
                { n: 'E', v: 'E' },
                { n: 'F', v: 'F' },
                { n: 'G', v: 'G' },
                { n: 'H', v: 'H' },
                { n: 'I', v: 'I' },
                { n: 'J', v: 'J' },
                { n: 'K', v: 'K' },
                { n: 'L', v: 'L' },
                { n: 'M', v: 'M' },
                { n: 'N', v: 'N' },
                { n: 'O', v: 'O' },
                { n: 'P', v: 'P' },
                { n: 'Q', v: 'Q' },
                { n: 'R', v: 'R' },
                { n: 'S', v: 'S' },
                { n: 'T', v: 'T' },
                { n: 'U', v: 'U' },
                { n: 'V', v: 'V' },
                { n: 'W', v: 'W' },
                { n: 'X', v: 'X' },
                { n: 'Y', v: 'Y' },
                { n: 'Z', v: 'Z' },
                { n: '0-9', v: '0-9' }
            ]
        },
        {
            key: 'order',
            name: '排序',
            value: [
                { n: '添加时间', v: 'time_add' },
                { n: '更新时间', v: 'time_update' },
                { n: '人气排序', v: 'hits' },
                { n: '评分排序', v: 'score' }
            ]
        }
    ];

    // 剧集特有的子分类（国产剧、港台剧等）
    var dramaClassFilter = [
        {
            key: 'sub_class',
            name: '剧集类型',
            value: [
                { n: '全部', v: '' },
                { n: '国产剧', v: '13' },
                { n: '港台剧', v: '14' },
                { n: '日剧', v: '15' },
                { n: '韩剧', v: '33' },
                { n: '欧美剧', v: '16' },
                { n: '泰剧', v: '34' },
                { n: '新马剧', v: '35' },
                { n: '其他剧', v: '25' }
            ]
        }
    ];

    return {
        class: [
            { type_id: '1', type_name: '电影' },
            { type_id: '2', type_name: '剧集' },
            { type_id: '3', type_name: '综艺' },
            { type_id: '4', type_name: '动漫' }
        ],
        filters: {
            '1': commonFilters,
            '2': commonFilters.concat(dramaClassFilter),
            '3': commonFilters,
            '4': commonFilters
        }
    };
}

// ============ 3. 分类分页 ============
async function categoryContent(tid, pg, filter, extend) {
    var p = parseInt(pg) || 1;
    var ext = extend || {};
    
    // URL 格式: /vodshow/2--------1---/ 或 /vodshow/2--------3---/
    // 参数顺序: /vodshow/{tid}-{sub_class}-{area}-{lang}-{year}-{letter}-{order}---{pg}---/
    var url = baseUrl + '/vodshow/' + tid;
    
    // 构建筛选参数
    var subClass = ext.sub_class || '';
    var area = ext.area || '';
    var lang = ext.lang || '';
    var year = ext.year || '';
    var letter = ext.letter || '';
    var order = ext.order || '';
    
    // 格式: tid-sub_class-area-lang-year-letter-order---pg---/
    url += '-' + subClass;
    url += '-' + area;
    url += '-' + lang;
    url += '-' + year;
    url += '-' + letter;
    url += '-' + order;
    url += '---' + p + '---/';
    
    var res = await fetch(url, { headers: headers });
    if (res.error || !res.doc) return Result.error(res.error || '请求失败');
    
    var list = extractList(res.doc);
    list = list.filter(function(item) {
        return item.vod_pic && item.vod_pic.indexOf('loading.png') === -1;
    });
    
    // 分析分页
    var pagecount = p;
    var nextLink = res.doc.querySelector('a[href*="---' + (p + 1) + '---"]');
    if (nextLink) {
        pagecount = p + 1;
    } else {
        // 检查尾页
        var lastLink = res.doc.querySelector('a[href*="---' + p + '---"]:not([href*="---1---"])');
        if (lastLink) {
            var match = lastLink.getAttribute('href').match(/---(\d+)---/);
            if (match && parseInt(match[1]) > pagecount) {
                pagecount = parseInt(match[1]);
            }
        }
        // 从分页文本中提取总页数
        var pageText = res.doc.querySelector('.page .page-info, .page .page-num');
        if (pageText) {
            var totalMatch = pageText.textContent.match(/\/\s*(\d+)/);
            if (totalMatch && parseInt(totalMatch[1]) > pagecount) {
                pagecount = parseInt(totalMatch[1]);
            }
        }
    }
    
    return { page: p, pagecount: pagecount, list: list, total: list.length };
}

// ============ 4. 详情页 ============
async function detailContent(ids) {
    var id = Array.isArray(ids) ? ids[0] : ids;
    var url = fixUrl(id);
    var res = await fetch(url, { headers: headers });
    if (res.error || !res.doc) return Result.error(res.error || '请求失败');
    
    var doc = res.doc;
    
    // 获取标题
    var vodName = safeText(doc.querySelector('h1')) || 
                  safeText(doc.querySelector('.vod-title')) ||
                  safeText(doc.querySelector('.title'));
    
    // 获取图片
    var picEl = doc.querySelector('.module-poster img, .poster img, .cover img, .vod-img img');
    var vodPic = '';
    if (picEl) {
        vodPic = picEl.getAttribute('data-original') || 
                 picEl.getAttribute('data-src') || 
                 picEl.src || '';
        vodPic = fixUrl(vodPic, doc);
        if (vodPic.indexOf('loading.png') > -1) vodPic = '';
    }
    
    // 获取简介
    var vodContent = safeText(doc.querySelector('.desc')) ||
                     safeText(doc.querySelector('.intro')) ||
                     safeText(doc.querySelector('.content')) ||
                     safeText(doc.querySelector('.summary')) ||
                     safeText(doc.querySelector('.detail-content'));
    
    // 获取剧集列表 - 使用 a[href*="/play/"]
    var epLinks = doc.querySelectorAll('a[href*="/play/"]');
    var eps = [];
    var seen = {};
    for (var i = 0; i < epLinks.length; i++) {
        var el = epLinks[i];
        var epName = safeText(el) || ('第' + (i + 1) + '集');
        var epUrl = fixUrl(el.getAttribute('href'), doc);
        if (!epUrl) continue;
        var key = epName + '|' + epUrl;
        if (seen[key]) continue;
        seen[key] = true;
        eps.push(epName + '$' + epUrl);
    }
    
    // 构建播放数据
    var playFrom = '在线播放';
    var playUrl = '';
    
    if (eps.length > 0) {
        // 按线路分组（URL 中的 /play/{vid}-{line}-{ep}/）
        var lines = {};
        for (var j = 0; j < eps.length; j++) {
            var parts = eps[j].split('$');
            if (parts.length !== 2) continue;
            var name = parts[0];
            var epUrl = parts[1];
            var match = epUrl.match(/\/play\/\d+-(\d+)-\d+\//);
            if (match) {
                var lineId = match[1];
                if (!lines[lineId]) lines[lineId] = [];
                lines[lineId].push(name + '$' + epUrl);
            } else {
                if (!lines['default']) lines['default'] = [];
                lines['default'].push(name + '$' + epUrl);
            }
        }
        
        var lineNames = {
            '1': '线路1',
            '2': '线路2', 
            '3': '线路3',
            '4': '线路4',
            '5': '线路5',
            '6': '线路6',
            '7': '线路7',
            'default': '在线播放'
        };
        
        var froms = [];
        var urls = [];
        for (var lineId in lines) {
            var name = lineNames[lineId] || ('线路' + lineId);
            froms.push(name);
            urls.push(lines[lineId].join('#'));
        }
        playFrom = froms.join('$$$');
        playUrl = urls.join('$$$');
    } else {
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

// ============ 5. 搜索 ============
async function searchContent(key, quick, pg) {
    var p = parseInt(pg) || 1;
    // 搜索 URL: /vodsearch/关键词-------------/?page=页码
    var url = baseUrl + '/vodsearch/' + encodeURIComponent(key) + '-------------/';
    if (p > 1) {
        url += '?page=' + p;
    }
    
    var res = await fetch(url, { headers: headers });
    if (res.error || !res.doc) return Result.error(res.error || '请求失败');
    
    var list = extractList(res.doc);
    list = list.filter(function(item) {
        return item.vod_pic && item.vod_pic.indexOf('loading.png') === -1;
    });
    
    // 分页判断
    var pagecount = p;
    var nextLink = res.doc.querySelector('a[href*="page=' + (p + 1) + '"]');
    if (nextLink) {
        pagecount = p + 1;
    }
    
    return { page: p, pagecount: pagecount, list: list, total: list.length };
}

// ============ 6. 播放器 ============
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

// ============ 7. 路由 ============
var routes = {
    homeVideoContent: function () { return false; },
    homeContent: function () { return false; },
    categoryContent: function () { return false; },
    detailContent: function () { return false; },
    searchContent: function () { return false; },
    playerContent: function () { return false; }
};
