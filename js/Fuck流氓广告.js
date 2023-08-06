// ==UserScript==
// @name         过图自定义
// @namespace    目的就是去广告，来自2019年3月
// @version      0.0.08
// @description  因zipym和zoe没有ChinaList和EnglishLite规则，也没有实时标记广告功能，且受屏幕响应影响，被垃圾黄色网站折磨到不行。需https://greasyfork.org/zh-CN/scripts/460743启用选择被动模式+这个可屏蔽大部分广告。如果不是遇到流氓网站就关了这个。
// @homepage     https://greasyfork.org/zh-CN/scripts/381167
// @author       unmht001
// @include      *
// @@run-at      document-start
// @@noframes
// @grant        none
// ==/UserScript==

var __clearflag=true;
var __clearhistory=[];
function clearzindex(c){
  if (__clearflag){
    console.log("clear z-index > 100.");
    Array.from(top.document.querySelectorAll('body *')).map(function (x){
      ((+window.getComputedStyle(x).zIndex || 0) >100) && (x.id != "cleartooldiv")?(x.style.cssText+=";z-index:-1;display:none"):"";
    });
    setTimeout(function (){clearzindex(c);},c)    
  }else{
    console.log("stop clear z-index");
  } 
}




function addbtn(){

  
  var div =top.document.createElement("div");
  div.id="cleartooldiv";
  div.style.cssText+=";position:fixed;z-index:2147483647;right:0px";
  var b1=top.document.createElement("button");
  b1.innerText = "弹出文字";  
  b1.onclick=function () {
    alert(top.document.body.innerText);
    window.scrollTo(0,top.document.body.clientHeight)
  };
  div.appendChild(b1);

  var b2=top.document.createElement("button");
  b2.innerText = "关闭图片";
  b2.onclick=function () {
    Array.from(top.document.getElementsByTagName("img")).map(
      function (x){x.style.cssText+=";display:none;width:0px;height:0px";}
    );
  };
  div.appendChild(b2);  
  
  var b3=top.document.createElement("button");
  b3.innerText = __clearflag?"正在清理":"清理上层";
  b3.onclick=function () {
    __clearflag = !__clearflag;
    this.innerText=__clearflag?"正在清理":"清理上层";
    if (__clearflag){
      clearzindex(1000);
    }
  };

  div.appendChild(b3);
  var b4=top.document.createElement("button");
  b4.innerText = "还原消除";

  b4.onclick=function () {
    top.document.execCommand("Undo");
  }

  div.appendChild(b4);
  var b5=top.document.createElement("button");
  b5.innerText = "上层消除";
  
  b5.onclick=function () {
    var _b5=[];
    var _z=0
    Array.from(top.document.querySelectorAll('body *')).map( function (x){
      var _x =(+window.getComputedStyle(x).zIndex || 0)
      if (_x==_z){
        x.id=="cleartooldiv"?"":(_b5.push(x));
        
      }else if(_x >_z){
        if (x.id!="cleartooldiv"){
          _b5=[];            
          _b5.push(x);
          _z=_x;
        
        }        
      }      
    });
    
    if (_z>0){
      _b5.map(function (x){      
        x.style.cssText+=";z-index:-1;display:none";
      });

      __clearhistory.push(_z);  
      console.log(_z,_b5,_b5.length);
    }else{
      console.log(_z,"nothing to clear");
    }
  
  }

  div.appendChild(b5);
  
  top.document.body.insertBefore(div, top.document.body.firstElementChild);  
  clearzindex(1000);
  

}
addbtn();