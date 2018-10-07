// ==UserScript==
// @icon         https://kyfw.12306.cn/otn/resources/images/ots/favicon.ico
// @name         火车票刷新重试
// @namespace    https://kyfw.12306.cn
// @version      0.1
// @description  刷新超时重试
// @author       大石头
// @match        *://kyfw.12306.cn/otn/leftTicket/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';
    var timer = null;
    $("#query_ticket").click(function (){
        var autoRefresh = $("#auto_query").prop('checked');
        if(autoRefresh){
            if(timer){
                clearInterval(timer);
                timer = null;
            }
            timer = setInterval(function (){
                var isNoTicket = false;
                var dList = $('.no-ticket');
                for(var i=0;i<dList.length;i++){
                    if(dList.eq(i).css('display') != 'none'){
                        isNoTicket = true;
                        break;
                    }
                }
                if(isNoTicket){
                    var btnText = $("#query_ticket").html();
                    if(btnText == '停止查询'){
                        $("#query_ticket").click();
                        setTimeout(function (){
                            $("#query_ticket").click();
                        },500);
                    }else{
                        $("#query_ticket").click();
                    }
                }
            },5000);
        }
    });
    $("body").append('<audio id="loginOutAudio" controls="controls" loop="loop""><source src="https://kydbj.oss-cn-beijing.aliyuncs.com/login-out.mp3"/></audio>');
    //检测登记超时,2分钟一次
    setInterval(function (){
        $.ajax({
            type: "GET",
            url: "/otn/index/initMy12306",
            success: function(data){
                if(data.indexOf("sessionInit = ''") >= 0){
                    $('#loginOutAudio')[0].play();
                }
            }
        });
    },2*60*1000);
})();