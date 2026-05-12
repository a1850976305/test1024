/*
@header({
  searchable: 2,
  filterable: 0,
  quickSearch: 1,
  title: '555电影-最新Netflix新剧韩国电影免费在线观看',
  '类型': '影视',
  lang: 'ds'
})
*/

var rule = {
  类型: '影视',
  title: '555电影-最新Netflix新剧韩国电影免费在线观看',
  desc: '55dy9.com资源站',
  host: 'https://www.55dy9.com/',
  url: '/vodtype/fypage/',
  searchUrl: '/vodsearch/-------------.html?wd=',
  searchable: 2,
  quickSearch: 1,
  filterable: 0,
  filter_url: '',
  filter: {},
  filter_def: {},
  headers: {"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36","Referer":"https://www.55dy9.com/"},
  class_name: 'Netflix&电影&连续剧&综艺纪录&动漫&擦边短剧',
  class_url: 'netflix&1&2&3&4&126',
  play_parse: true,
  limit: 6,
  double: false,

  推荐: async function (tid, pg, filter, extend) {
    let {input, pdfa, pdfh, pd} = this;
    let html = await request(input);
    let d = [];
    let data = pdfa(html, '.module-item');
    data.forEach((it) => {
      let url = pd(it, 'a&&href');
      let title = pdfh(it, '.module-poster-item-title&&Text');
      let pic_url = pd(it, 'img&&data-original');
      if (!pic_url) pic_url = pd(it, 'img&&src');
      let desc = pdfh(it, '.module-item-note&&Text');
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
    if (tid === '1') category = '/vodtype/1';
    else if (tid === '2') category = '/vodtype/2';
    else if (tid === '3') category = '/vodtype/3';
    else if (tid === '4') category = '/vodtype/4';
    else if (tid === '126') category = '/vodtype/126';
    else if (tid === 'netflix') category = '/label/netflix';
    else category = '/vodtype/1';
    
    let url = this.host + category + '.html?page=' + pg;
    let html = await request(url);
    let d = [];
    let data = pdfa(html, '.module-item');
    data.forEach((it) => {
      let url = pd(it, 'a&&href');
      let title = pdfh(it, '.module-poster-item-title&&Text');
      let pic_url = pd(it, 'img&&data-original');
      if (!pic_url) pic_url = pd(it, 'img&&src');
      let desc = pdfh(it, '.module-item-note&&Text');
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
    let url = this.host + 'voddetail/' + id + '.html';
    let html = await request(url);
    
    let title = pdfh(html, '.module-info-heading&&Text');
    let pic_url = pd(html, '.module-info-poster img&&data-original');
    if (pic_url && !pic_url.startsWith('http')) {
      pic_url = this.host + pic_url;
    }
    
    let desc = pdfh(html, '.module-info-introduction&&Text');
    let tabs = pdfa(html, '.module-tab-item');
    let playList = [];
    
    if (tabs.length > 0) {
      tabs.forEach((tab) => {
        let tabName = pdfh(tab, '.module-tab-name&&Text') || pdfh(tab, 'span&&Text');
        let episodes = pdfa(tab, '.module-play-list a, .module-episodes a');
        let episodeList = [];
        episodes.forEach((ep) => {
          let epUrl = pd(ep, 'a&&href');
          let epTitle = pdfh(ep, 'a&&Text');
          if (epUrl && epTitle) {
            episodeList.push(epTitle.trim() + '$' + epUrl);
          }
        });
        if (episodeList.length > 0) {
          playList.push({
            name: tabName ? tabName.trim() : '播放',
            url: episodeList.join('#')
          });
        }
      });
    }
    
    if (playList.length === 0) {
      let episodes = pdfa(html, '.module-play-list a, .module-episodes a, .play-list a');
      let episodeList = [];
      episodes.forEach((ep) => {
        let epUrl = pd(ep, 'a&&href');
        let epTitle = pdfh(ep, 'a&&Text');
        if (epUrl && epTitle) {
          episodeList.push(epTitle.trim() + '$' + epUrl);
        }
      });
      if (episodeList.length > 0) {
        playList.push({
          name: '播放',
          url: episodeList.join('#')
        });
      }
    }
    
    return setResult({
      title: title,
      pic_url: pic_url,
      desc: desc,
      url: url,
      play: playList
    });
  },

  搜索: async function (wd, quick, pg) {
    let {input, pdfa, pdfh, pd} = this;
    let url = this.host + '/vodsearch/-------------.html?wd=' + wd + '&page=' + pg;
    let html = await request(url);
    let d = [];
    let data = pdfa(html, '.module-item');
    data.forEach((it) => {
      let url = pd(it, 'a&&href');
      let title = pdfh(it, '.module-card-item-title&&Text');
      let pic_url = pd(it, 'img&&data-original');
      if (!pic_url) pic_url = pd(it, 'img&&src');
      let desc = pdfh(it, '.module-item-note&&Text');
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
    
    let html = await request(input);
    
    let iframeSrc = pd(html, 'iframe&&src');
    if (iframeSrc) {
      if (iframeSrc.startsWith('/')) {
        iframeSrc = this.host + iframeSrc;
      }
      return {
        url: iframeSrc,
        header: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Referer": this.host
        }
      };
    }
    
    return {};
  }
};
