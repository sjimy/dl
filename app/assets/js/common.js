
// 1=教师端，2=家长端
function getAppType(){
  return 1;
}

// 是否访问正式服务器
//true = 正式服务器
//false = 测试服务器
function useOnlineServer(){
  return false;
}

//切换当前的相对路径
if(window.location.href.indexOf("shjian.cc")>=0){
  $("base").attr("href","/app/");
}else{
  $("base").attr("href","/");
}

/**
 * 原生调用前端方法
 * @param actionId 动作ID
 * @param status 状态，0=成功，1=失败
 * @param result 返回参数，支持json
 */
function nativeExec(actionId,status,result){
  //$('#testDiv').html("actionId:"+actionId+"  status:"+status+"  result:"+result);
  if(result && result.indexOf('{') == 0 && result.lastIndexOf('}') == result.length-1){
    result = JSON.parse(result);
  }
  var itemExec = execHolders[actionId];
  if(itemExec){
    itemExec.callback(status,result);
    if(!itemExec.isKeep){
      delete execHolders[actionId];
    }
  }
}

/**
 * 添加监听远程调用回调，
 * @param actionId 动作ID
 * @param isKeep 是否保持一直有效
 * @param callback 回调动作
 */
var execHolders = {};
function addExecHolder(actionId,isKeep,callback){
  execHolders[actionId] = {
    actionId:actionId,
    isKeep:isKeep,
    callback:callback
  };
}

/**
 * 写入css
 */
var lazyLoadCssList = [];
function loadCSS(url,rel,type){
  var exist = false;
  lazyLoadCssList.forEach(function(item){
    if(item.url == url && item.rel == rel && item.type == type){
      exist = true;
    }
  });
  if(exist)return;
  var link = document.createElement("link");
  if(type){
    link.type = type;
  }
  if(rel){
    link.rel = rel;
  }
  link.href = url;
  document.getElementsByTagName("head")[0].appendChild(link);
  lazyLoadCssList.push({url:url,rel:rel,type:type});
  console.log("lazyload "+url);
}

/**
 * 写入javascrpt
 */
var lazyLoadJsList = [];
function loadScript(url,language,type){
  var exist = false;
  lazyLoadJsList.forEach(function(item){
    if(item.url == url && item.language == language && item.type == type){
      exist = true;
    }
  });
  if(exist)return;
  var script = document.createElement("script");
  if(language){
    script.language = language;
  }
  if(type){
    script.type = type;
  }
  script.src = url;
  document.body.appendChild(script);
  lazyLoadJsList.push({url:url,language:language,type:type});
  console.log("lazyload "+url);
}


/**
 * 从浏览器Url获取参数
 */
function getParamFromUrl(key){
  var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)","i");
  var r = window.location.search.substr(1).match(reg);
  if (r!=null) return (r[2]); return null;
}


