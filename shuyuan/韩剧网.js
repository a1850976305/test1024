/*
@header({
  searchable: 1,
  filterable: 0,
  quickSearch: 0,
  title: '韩剧网',
  '类型': '影视',
  lang: 'zh'
})
*/

var rule = {
    title: '韩剧网',
    host: 'https://www.thanju.com',
    url: '/dianshiju.html',
    searchUrl: '/search/**.html',
    一级: '.myui-vodlist__detail;h4&&Text;h4&&a&&href;p&&Text',
    二级: {
        title: 'h1&&Text',
        img: '.module-item-pic img&&src',
        desc: '.module-info-item:eq(3)&&Text;.module-info-item:eq(4)&&Text;.module-info-item:eq(5)&&Text;.module-info-item:eq(6)&&Text',
        content: '.vod_content&&Text',
        tabs: '.module-tab-item&&Text',
        lists: '.module-play-list&&li;a&&Text;a&&href',
    },
    搜索: '.myui-vodlist__detail;h4&&Text;h4&&a&&href;p&&Text',
}