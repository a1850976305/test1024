/*
@header({
  searchable: 2,
  filterable: 0,
  quickSearch: 1,
  title: '4k影视-高清4K影视在线观看',
  '类型': '影视',
  lang: 'ds'
})
*/

var rule = {
  类型: '影视',
  title: '4k影视-高清4K影视在线观看',
  desc: '4kvm.net资源站',
  host: 'https://www.4kvm.net/',
  url: '/movie?page=fypage/',
  searchUrl: '/search?q=',
  searchable: 2,
  quickSearch: 1,
  filterable: 0,
  filter_url: '',
  filter: {},
  filter_def: {},
  headers: {"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36","Referer":"https://www.4kvm.net/"},
  class_name: '电影&电视剧&动漫',
  class_url: 'movie&tv&anime',
  play_parse: true,
  limit: 6,
  double: false,

  推荐: async function (tid, pg, filter, extend) {
    let {input, pdfa, pdfh, pd} = this;
    let html = await request(input);
    let d = [];
    let data = pdfa(html, '.grid a[href*="/play/"]');
    data.forEach((it) => {
      let url = pd(it, 'a&&href');
      let title = pdfh(it, 'h3&&Text');
      let pic_url = pd(it, 'img&&data-src');
      if (!pic_url) pic_url = pd(it, 'img&&src');
      let desc = pdfh(it, '.text-xs.text-gray-300&&Text');
      if (title && url) {
        d.push({
          title: title.trim(),
          pic_url: pic_url,
          desc: desc ? desc.trim() : '',
          url: url
        });
      }
    });
    return setResult(d);
  },

  一级: async function (tid, pg, filter, extend) {
    let {input, pdfa, pdfh, pd} = this;
    let category = '';
    if (tid === 'movie') category = '/movie';
    else if (tid === 'tv') category = '/tv';
    else if (tid === 'anime') category = '/anime';
    else category = '/movie';
    
    let url = this.host + category + '?page=' + pg;
    let html = await request(url);
    let d = [];
    let data = pdfa(html, '.grid a[href*="/play/"]');
    data.forEach((it) => {
      let url = pd(it, 'a&&href');
      let title = pdfh(it, 'h3&&Text');
      let pic_url = pd(it, 'img&&data-src');
      if (!pic_url) pic_url = pd(it, 'img&&src');
      let desc = pdfh(it, '.text-xs.text-gray-300&&Text');
      if (title && url) {
        d.push({
          title: title.trim(),
          pic_url: pic_url,
          desc: desc ? desc.trim() : '',
          url: url
        });
      }
    });
    return setResult(d);
  },

  二级: async function (id, flags, extend) {
    let {input, pdfa, pdfh, pd} = this;
    let url = this.host + 'play/' + id;
    let html = await request(url);
    
    let title = pdfh(html, 'h1&&Text');
    let pic_url = pd(html, '.cover img&&src');
    if (pic_url && !pic_url.startsWith('http')) {
      pic_url = this.host + pic_url;
    }
    
    let desc = pdfh(html, '.desc,.description&&Text');
    let tabs = pdfa(html, '.episode a, .playlist a, a[href*="/play/"]');
    let playUrl = pd(html, 'video&&src');
    
    if (!playUrl) {
      let iframe = pd(html, 'iframe&&src');
      if (iframe) {
        playUrl = iframe;
      }
    }
    
    let d = [];
    if (tabs.length > 0) {
      let playList = [];
      tabs.forEach((it) => {
        let epUrl = pd(it, 'a&&href');
        let epTitle = pdfh(it, 'a&&Text') || pdfh(it, 'span&&Text');
        if (epUrl && epTitle) {
          playList.push(epTitle.trim() + '$' + epUrl);
        }
      });
      if (playList.length > 0) {
        d.push({
          name: '播放',
          url: playList.join('#')
        });
      }
    }
    
    return setResult({
      title: title,
      pic_url: pic_url,
      desc: desc,
      url: url,
      play: d
    });
  },

  搜索: async function (wd, quick, pg) {
    let {input, pdfa, pdfh, pd} = this;
    let url = this.host + '/search?q=' + wd + '&page=' + pg;
    let html = await request(url);
    let d = [];
    let data = pdfa(html, '.grid a[href*="/play/"]');
    data.forEach((it) => {
      let url = pd(it, 'a&&href');
      let title = pdfh(it, 'h3&&Text');
      let pic_url = pd(it, 'img&&data-src');
      if (!pic_url) pic_url = pd(it, 'img&&src');
      let desc = pdfh(it, '.text-xs.text-gray-300&&Text');
      if (title && url) {
        d.push({
          title: title.trim(),
          pic_url: pic_url,
          desc: desc ? desc.trim() : '',
          url: url
        });
      }
    });
    return setResult(d);
  },

  懒加载: async function (flag, id, flags) {
    let {input, pdfa, pdfh, pd, print} = this;
    
    let playUrl = '';
    let videoId = id;
    
    // 尝试调用视频播放API (需要签名参数，简化版可能失败)
    let apiUrl = this.host + 'video/play?v=' + videoId + '&q=720';
    
    try {
      let apiHtml = await request(apiUrl);
      let apiData = JSON.parse(apiHtml);
      if (apiData.code === 200 && apiData.data && apiData.data.quality_urls) {
        let qualityList = apiData.data.quality_urls;
        // 尝试获取720p免费链接
        for (let q of qualityList) {
          if (q.bitrate === 720 && q.url && q.url.startsWith('http')) {
            playUrl = q.url;
            break;
          }
        }
        // 如果没有720p，尝试其他免费质量
        if (!playUrl) {
          for (let q of qualityList) {
            if (q.url && q.url.startsWith('http')) {
              playUrl = q.url;
              break;
            }
          }
        }
      }
    } catch (e) {
      print('API调用失败: ' + e.message);
    }
    
    // 如果API失败，尝试从页面提取
    if (!playUrl) {
      let html = await request(input);
      let videoSrc = pd(html, 'video&&src');
      if (videoSrc && videoSrc.startsWith('http')) {
        playUrl = videoSrc;
      }
    }
    
    if (playUrl && !playUrl.startsWith('http')) {
      playUrl = 'https:' + playUrl;
    }
    
    if (playUrl) {
      return {
        url: playUrl,
        header: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Referer": this.host
        }
      };
    }
    
    // 返回空对象，让播放器使用外部解析
    return {};
  }
};
