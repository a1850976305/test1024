/*
@header({
  searchable: 1,
  filterable: 0,
  quickSearch: 0,
  title: '修罗影视',
  '类型': '影视',
  lang: 'zh'
})
*/

var rule = {
    title: '修罗影视',
    host: 'https://v.xlys.ltd.ua',
    url: '/s/fyclass',
    searchUrl: '',
    class_parse: '.navbar-nav&&a:not(.dropdown-toggle);a&&Text;a&&href;/s/(.*?)(;jsessionid.*)?',
    class_name: '动作&爱情&喜剧&科幻&恐怖&战争&短剧&武侠&魔幻&剧情&动画&惊悚&3D&灾难&悬疑&警匪&文艺&青春&冒险&犯罪&记录&古装&奇幻&国语&综艺&历史&运动&原创压制&美剧&韩剧&国产电视剧&日剧&英剧&德剧&俄剧&巴剧&加剧&西剧&意大利剧&泰剧&港台剧&法剧&澳剧',
    class_url: 'dongzuo&aiqing&xiju&kehuan&kongbu&zhanzheng&duanju&wuxia&mohuan&juqing&donghua&jingsong&3D&zainan&xuanyi&jingfei&wenyi&qingchun&maoxian&fanzui&jilu&guzhuang&qihuan&guoyu&zongyi&lishi&yundong&yuanchuang&meiju&hanju&guoju&riju&yingju&deju&eju&baju&jiaju&spanish&yidaliju&taiju&gangtaiju&faju&aoju',
    二级: {
        title: 'title&&Text',
        img: 'meta[itemprop="image"]&&content',
        desc: 'meta[name="description"]&&content',
        content: '',
        tabs: '.list&&a;Text',
        lists: '.list&&li;a&&Text;a&&href',
    },
    搜索: '',
}