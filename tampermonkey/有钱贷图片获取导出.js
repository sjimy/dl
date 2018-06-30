// ==UserScript==
// @icon         https://yqd.fanzhoutech.com/Favicons/favicon-32x32.png
// @name         有钱贷图片获取导出
// @namespace    https://yqd.fanzhoutech.com
// @version      0.1
// @description  图片获取导出
// @author       大石头
// @match        *://*.fanzhoutech.com/*
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(".batch-panel{ position: absolute;bottom: 50px;left: 50px;background: #eeeeee;padding: 10px;border-radius: 10px;min-width: 250px;z-index:9999;}");
GM_addStyle(".batch-panel .num{text-align: center; padding: 5px 0 10px 0;font-size: 20px;}");
GM_addStyle(".batch-panel .status{text-align:center;padding:5px 0 10px 0;font-size:18px;}");
GM_addStyle(".batch-panel button{width:100%;height:30px;margin-top:5px;}");
GM_addStyle(".batch-panel .panel-form{display: none;}");
GM_addStyle(".panel-task{display: none}");
GM_addStyle(".panel-task form{display: none}");
GM_addStyle(".panel-task #btn-export{display: none}");
GM_addStyle(".panel-form{padding: 5px;}");
GM_addStyle(".panel-form >div{font-size:18px;margin-bottom: 5px;}");
GM_addStyle(".panel-form input{margin-left: 5px;padding: 2px 5px;}");
GM_addStyle(".batch-table{display: none}");


(function() {
    'use strict';

    var href = window.location.href;

    if(href.indexOf('/admin') >=0){
        initPage();
    }else{
        $('#form_login .form-actions button').on('click',function (){
            localStorage.setItem('_username',$('#Account').val());
            localStorage.setItem('_password',$('#Password').val());
        })
    }
})();

var apiHost = window.location.protocol+"//"+window.location.host;

function initPage(){
    var panelHtml = '';
    panelHtml += '    <div class="batch-panel">';
    panelHtml += '        <div class="status">等待添加任务</div>';
    panelHtml += '        <div class="panel-form">';
    panelHtml += '            <div>开始时间<input id="startInput"></div>';
    panelHtml += '            <div>结束时间<input id="endInput"></div>';
    panelHtml += '            <div><button id="btn-start" class="btn btn-primary">开始获取数据</button></div>';
    panelHtml += '        </div>';
    panelHtml += '        <div class="panel-task">';
    panelHtml += '            <div class="num numPage">页数 0/0</div>';
    panelHtml += '            <div class="num numTask">任务数 0/0</div>';
    panelHtml += '            <form id="panel-task-form" action="http://47.94.229.76/api/accountYqd/export" method="post"  target="_blank" enctype="multipart/form-data" >';
    panelHtml += '                <input name="data">';
    panelHtml += '            </form>';
    panelHtml += '            <div><button id="btn-export" class="btn btn-primary">导出到文件</button></div>';
    panelHtml += '        </div>';
    panelHtml += '    </div>';
    $('body').append(panelHtml);

    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth()+1;
    var date = currentDate.getDate();
    if(month<10)month="0"+month;
    if(date<10)date="0"+date;
    $("#endInput").val(year+"-"+month+"-"+date);

    var startDate = new Date(new Date()- (currentDate.getDate()-1)*24*60*60*1000);
    var year2 = startDate.getFullYear();
    var month2 = startDate.getMonth()+1;
    var date2 = startDate.getDate();
    if(month2<10)month2="0"+month2;
    if(date2<10)date2="0"+date2;
    $("#startInput").val(year2+"-"+month2+"-"+date2);

    let u = localStorage.getItem('_username');
    let p = localStorage.getItem('_password');
    if(!u || !p){
        updateStatus('请注销后重新登陆');
        $('#btn-start').hide();
        return;
    }
    var formData = new FormData();
    formData.append("u",u);
    formData.append("p",p);
    updateStatus('验证中');
    $.ajax({
        url:"http://47.94.229.76/api/accountYqd/validate",
        type: 'POST',
        cache: false,
        data: formData,
        dataType: "json",
        processData: false,
        contentType: false,
        success:function(data){
            if(data.success){
                updateStatus('等待添加任务');
                $('.batch-panel .panel-form').show();
                $('#btn-start').unbind('click').on('click',toStart);
            }else{
                updateStatus(data.message);
            }
        },
        error:function(xhr,status,error){
            updateStatus("验证失败"+status);
        }
    });
}

function toStart(){
    $(".panel-form").hide();
    $(".panel-task").show();

    var startTime = $("#startInput").val();
    var endTime = $("#endInput").val();

    $('#btn-start').hide();
    loadPageData(startTime,endTime,1,0,[],function (list){
        $('#btn-export').show();
        $('#btn-export').unbind('click').on('click',function (){
            var arrayObj = [];
            for(var i=0;i<list.length;i++){
                var item = list[i];
                arrayObj.push({
                    name:item.name,
                    phone:item.cellPhoneNumber,
                    img1:item.img1,
                    img2:item.img2,
                    img3:item.img3
                });
            }
            var str = JSON.stringify(arrayObj);
            $('#panel-task-form input').val(str);
            $("#panel-task-form").submit();
        });
    });
}

function loadPageData(startDate,endDate,page,errorCount,list,success){
    updateStatus("加载第"+page+"页中");
    var reqData = {
        AuditedEndTime: "",
        AuditedStartTime: "",
        ChannelId: "",
        DateLength: 9999,
        EndDate: endDate,
        HandlerName: "",
        IsDistribution: "",
        Keyword: "",
        StartDate: startDate,
        Status: "",
        'sorts[appliedTime]': "desc",
        'sorts[zhiMaScore]': "desc",
        page: page,
        size: 50
    };
    $.ajax({
        url:apiHost+"/admin/applyform/list",
        dataType:"json",
        contentType:"application/x-www-form-urlencoded",
        type:"POST",
        data:reqData,
        success:function(data){

            if(data.code){
                updateStatus(data.message);
                $(".panel-form").show();
                $(".panel-task").hide();
                return;
            }

            var pageCount = data.pageCount;
            var totalCount = data.totalCount;
            list = list.concat(data.data);
            updateNumPage(page,pageCount);
            updateNumTask(0,list.length);
            if(page < pageCount){
                page++;
                updateStatus("等等8秒后");
                waitTimer(8000,"加载下页",function (){
                    loadPageData(startDate,endDate,page,errorCount,list,success);
                });
            }else{
                updateStatus("加载分页数据完成");
                loadDetailPageData(list,0,errorCount,function (newList){
                    success(newList);
                });
            };
        },
        error:function(xhr,status,error){
            errorCount++;
            updateStatus(status+",稍后马上重试"+errorCount);
            setTimeout(function (){
                loadPageData(startDate,endDate,page,errorCount,list,success);
            },3*1000);
        }
    });
}

function loadDetailPageData(list,index,errorCount,success){
    var item = list[index];
    var id = encodeParameters(item.customerApplyFormData);
    updateStatus("加载第"+(index+1)+"条数据");
    $.ajax({
        url:apiHost+"/admin/applyform/detail/"+id,
        type:"GET",
        success:function(data){
            updateNumTask(index+1,list.length);

            data = data.substring(data.indexOf('身份证信息'));
            var s1 = data.indexOf('<img src="')+10;
            data = data.substring(s1);
            var e1 = data.indexOf('" />');
            var img1 = data.substring(0,e1);

            var s2 = data.indexOf('<img src="')+10;
            data = data.substring(s2);
            var e2 = data.indexOf('" />');
            var img2 = data.substring(0,e2);

            var s3 = data.indexOf('<img src="')+10;
            data = data.substring(s3);
            var e3 = data.indexOf('" />');
            var img3 = data.substring(0,e3);

            item['img1'] = img1;
            item['img2'] = img2;
            item['img3'] = img3;

            if(index+1 < list.length){
                index++;
                loadDetailPageData(list,index,errorCount,success);
            }else{
                updateStatus("任务完成");
                success(list);
            }
        },
        error:function(xhr,status,error){
            errorCount++;
            updateStatus(status+",稍后马上重试"+errorCount);
            setTimeout(function (){
                loadDetailPageData(list,index,errorCount,success);
            },3*1000);
        }
    });
}

function waitTimer(sec,msg,success){
    updateStatus(Math.floor(sec/1000)+"秒后"+msg);
    setTimeout(function (){
        sec-=1000;
        if(sec <= 0){
            success();
        }else{
            waitTimer(sec,msg,success);
        };
    },1000);
}

function updateNumPage(num,total){
    $(".batch-panel .numPage").html("页数 "+num+"/"+total);
}

function updateNumTask(num,total){
    $(".batch-panel .numTask").html("任务数 "+num+"/"+total);
}

function updateStatus(msg){
    $(".batch-panel .status").html(msg);
}
