$(".header__burger").click(function(){
   $(this).toggleClass("active");
   $(".mobile-menu").slideToggle();
  });



  // drag function
$.fn.drags = function (opt) {
   opt = $.extend({
     handle: "",
     cursor: "move",
     z_index: 1,
     onStart: function () {},
     onMove: function () {},
     onDrop: function () {},
     pos_x: 0,
     pos_y: 0,
     filterDrag: function (obj) {return obj;}
   }, opt);
   var $handle, $drag;
   if (opt.handle === "") $handle = this;
   else {
     $handle = this.find(opt.handle);
     $handle.addClass('active-handle');
   }
   $drag = $(this);
   //console.log($drag);
 
   return $handle.css('cursor', opt.cursor).on("mousedown touchstart", function (e, touch) {
     let curDrag = opt.filterDrag($drag);
     if (!curDrag.length) return;
 
     curDrag.addClass('draggable');
     //var z_idx = curDrag.css('zIndex');
     curDrag.css('zIndex', opt.z_index);
 
     var body = $('body');
     var drg_h, drg_w, pageX, pageY;
     let d = e.type === 'mousedown' ? e : e.changedTouches[0];
     pageX = d.pageX; pageY = d.pageY;
     drg_h = curDrag.outerHeight();
     drg_w = curDrag.outerWidth();
     curDrag.pos_y = curDrag.offset().top + drg_h - pageY;
     curDrag.pos_x = curDrag.offset().left + drg_w - pageX;
     //console.log(pageX,pageY,drg_w,drg_h,curDrag.offset().left,curDrag.offset().top);
 
     opt.onStart(curDrag);
     function onMove(e, touch) {
       if (curDrag === undefined || !curDrag.length || !curDrag.hasClass('draggable')) return;
         let d = e.type === 'mousemove' ? e : e.changedTouches[0];
         pageX = d.pageX; pageY = d.pageY;
         curDrag.offset({
           top: pageY + curDrag.pos_y - drg_h,
           left: pageX + curDrag.pos_x - drg_w
         });
         opt.onMove(curDrag,e);
     }
     function onUp(e) {
       //console.log('mouseup',obj);
       if (curDrag !== undefined && curDrag.length && curDrag.hasClass('draggable')) {
         curDrag.removeClass('draggable').css({'z-index':''});
 
         opt.onDrop(opt.filterDrag(curDrag), e);
         body.off("mousemove touchmove", onMove).off("mouseup touchend", onUp);
       }
     }
 
     body.on("mousemove touchmove", onMove).on("mouseup touchend", onUp);
     // obj = $('.draggable');
     // console.log('start:',obj);
     e.preventDefault(); // disable selection
   });
 };
 
 
 
 /* test */
 
 $(document).ready(function() {
     startInterval();
     //http://special2.woman.ru/mig/get_motivation.php
     $.getJSON('get_motivation.json', function(data) {
         $('.mig-circle .text').html(data.motivation);
     });
 
     //http://special2.woman.ru/mig/situations.php
     $.getJSON('situations.json', function(data) {
         countQuestions = data.situations.length;
         $.each(data.situations, function( index, value ) {
             $('.test__cards').prepend('<div class="test__card test-card"> <div class="test__number"><span class="num_cur">'+(index+1)+'</span>/<span class="num_max">'+countQuestions+'</span></div><div class="card__pic"><img src="'+value.image+'" alt=""></div><div class="card__text">'+value.text+'</div></div>');
         });
         // $('.test__cards .test__card:last-child').addClass('current');
 
         let w = $(window).width();
         let k = w > 1024 ? 100 : 60;
 
         $('.test__card').drags({
             z_index: 1,
             cursor: 'pointer',
             filterDrag: function(obj) {
                 return obj.filter('.current');
             },
             onStart: function(obj) {
                 let start = Math.round(obj.position().left);
                 obj.data('start',start);
                 obj.data('left',start);
             },
             onMove: function(obj,e) {
                 let left = Math.round(obj.position().left);
                 obj.data('left', left);
                 let pos = left - obj.data('start');
                 let offs = pos /w * k;
                 obj.css('transform','rotate('+offs+'deg) scale('+
                     (1 -Math.abs(offs/100))+')');
                 if (Math.abs(pos) > 40) {
                     curAnswer = pos < 0 ? 1 : 2;
                     if (pos > 0){
                         $('.test__button.left').removeClass('current');
                         $('.test__button.right').addClass('current');
                     } else {
                         $('.test__button.left').addClass('current');
                         $('.test__button.right').removeClass('current');
                     }
                 }
 
                 resetInterval();
             },
             onDrop: function (obj,e) {
                 let res = obj.data('left') - obj.data('start');
                 if (Math.abs(res) > 40) {
                     selectAnswer(res  > 0);
                     nextQuest(obj);
                 }
                 obj.css({top:'', left: ''});
                 obj.css('transform','');
                 $('.test__button').removeClass('current');
                 resetInterval();
             }
         });
     });
 
     $.getJSON('results.json', function(data) {
         results = data.results;
         $('.question').html(results[0].text);
         $('.smile .text').html(results[0].procent+'%');
     });
 });
 
 

 
 
 var counter = 0;
 var timer = null;
 
 function tictac(){
     counter++;
     if (counter == 5){
         $.getJSON('get_motivation.json', function(data) {
             $('.mig-circle .text').html(data.motivation);
         });
         $('.mig-circle').addClass('active');
     }
 }
 
 function resetInterval(){
     $('.mig-circle').removeClass('active');
     clearInterval(timer);
     counter=0;
     timer= setInterval("tictac()", 1000);
 }
 function startInterval(){
     if (!timer){
         timer= setInterval("tictac()", 1000);
     }
 }
 function stopInterval(){
     clearInterval(timer);
 }
 
 
 resultNumber = 0;
 testResults = [];
 curNumber = 0;
 procent = 0;
 
 $('.test__button.left').click(function () {
     selectAnswer(false);
     var item = $('.test__card.current');
     nextQuest(item);
     item.css({top:'', left: ''});
     item.css('transform','');
     $('.test__button').removeClass('current');
     resetInterval();
 });
 
 $('.test__button.right').click(function () {
     selectAnswer(true);
     var item = $('.test__card.current');
     nextQuest(item);
     item.css({top:'', left: ''});
     item.css('transform','');
     $('.test__button').removeClass('current');
     resetInterval();
 });
 
 
 function selectAnswer(res){
     if (res) {
         resultNumber++;
         if (resultNumber > 20) resultNumber = 20;
 
         testResults.push(1);
     } else {
         testResults.push(0);
     }
     if (curNumber === countQuestions-1) testEnd(procent.toFixed());
     else curNumber++;
 }
 
 function nextQuest(obj) {
     obj.remove();
     $('.test__cards .test__card:last-child').addClass('current');
 }
 
 function testEnd(procent) {
     stopInterval();
     var status = '';
     var dataUrl = '';
     var dataTitle = '';
     var dataImage="https://bolitgolova.wday.ru/images/share.jpg";
     if (procent > 66){
         status = 'result-3';
         dataTitle = "У меня " + $('.title-3').html().toLowerCase();
         dataUrl = "https://bolitgolova.wday.ru/share/3/";
     } else if (procent > 33){
         status = 'result-2';
         dataTitle = "У меня " + $('.title-2').html().toLowerCase();
         dataUrl = "https://bolitgolova.wday.ru/share/2/";
     } else{
         status = 'result-1';
         dataTitle = "У меня " + $('.title-1').html().toLowerCase();
         dataUrl = "https://bolitgolova.wday.ru/share/1/";
     }
     $('.section-2').slideUp(300,function () {
         $('.section-result .border-block').addClass(status);
         $('.section-result').slideDown(300);
         $('.section-result .share .flex-block').attr('data-url', dataUrl);
         $('.section-result .share .flex-block').attr('data-title', dataTitle);
         $('.section-result .share .flex-block').attr('data-image', dataImage);
     });
 
     //отправка данных
     var resultSend = JSON.stringify( testResults );
     $.ajax({
         type: "POST",
         //url: "lihk_to_result.php",
         url: "http://localhost/results.php",
         data: { ansver : resultSend },
         success: function(data) {
             var parse = JSON.parse(data);
             results = parse.results;
             $('.question').html(results[0].text);
             $('.smile .text').html(results[0].procent+'%');
         }
     });
 }
 
 
 

 
 $('.border-block').mouseleave(function (e) {
     $('.smile').removeAttr( 'style' ).removeClassWild("status_*");
     $('.question').html(results[0].text);
     $('.smile .text').html(results[0].procent+'%');
 });
 
 
 
 (function($) {
     $.fn.removeClassWild = function(mask) {
         return this.removeClass(function(index, cls) {
             var re = mask.replace(/\*/g, '\\S+');
             return (cls.match(new RegExp('\\b' + re + '', 'g')) || []).join(' ');
         });
     };
 })(jQuery);