$(".header__burger").click(function(){
   $(this).toggleClass("active");
   $(".mobile-menu").slideToggle();
  });


 /* test */
function getMostFrequentElement(inputArg) {
    var type = typeof inputArg,
        length,
        mostFrequent,
        counts,
        index,
        value;
    if (inputArg === null || type === 'undefined') {
        throw TypeError('inputArg was "null" or "undefined"');
    }
    mostFrequent = [];
    if (type === 'function' || !Object.prototype.hasOwnProperty.call(inputArg, 'length')) {
        mostFrequent[0] = inputArg;
        mostFrequent[1] = 1;
    } else {
        counts = {};
        length = inputArg.length;
        for (index = 0; index < length; index += 1) {
            value = inputArg[index];
            type = typeof value;
            counts[type] = counts[type] || {};
            counts[type][value] = (counts[type][value] || 0) + 1;
            if (!mostFrequent.length || counts[type][value] >= mostFrequent[1]) {
                mostFrequent[0] = value;
                mostFrequent[1] = counts[type][value];
            }
        }
    }
    return mostFrequent;
}


function setQuest(currentQuestion,quests){
    var left = quests.test[currentQuestion-1].variants[0].img;
    var right = quests.test[currentQuestion-1].variants[1].img;
    var vopros = quests.test[currentQuestion-1].vopros;

    $('.test__counter-current').html(currentQuestion);
    $('.test__question-test').html(vopros);
    $('.test__left img').attr('src',left);
    $('.test__right img').attr('src',right);

    $('.test__left,.test__right').removeClass('like dislike');
    $('.test__otvets').removeClass('active');
    $('.test__otvet,.test__status').html('');
    blocked = false;
}


function setResults(position,currentQuestion,quests,testResults){
    var correct = quests.test[currentQuestion-1].variants[position].correct;
    var otvet = quests.test[currentQuestion-1].text;
    testResults.push(correct);
    $('.test__otvets').addClass('active');
    $('.test__otvet').html(otvet);
    if (correct == 1){
        $('.test__status').html('Вернo');
    } else {
        $('.test__status').html('Неверно');
    }
    console.log(position);
    if (position == 0) {
        $('.test__left').addClass('like')
    } else {
        $('.test__right').addClass('like')
    }
}

function showResults(testResults){
    $.getJSON('results.json', function(data) {
        var results = data;
        var $tmp = getMostFrequentElement(testResults)[0];
        var title = results.results[$tmp].title;
        var text = results.results[$tmp].text;

        $('.test__result-title').html(title);
        $('.test__result-text').html(text);
        $('.test__inner').hide();
        $('.test__results').show();
    });
}

$(document).ready(function() {
    if ($('.test__inner').length > 0){
        currentQuestion = 0;
        countQuestions = 1;
        testResults = [];
        blocked = false;

        $.getJSON('test.json', function(data) {
            quests = data;
            countQuestions = quests.test.length;
            $('.test__counter-total').html(countQuestions);
            currentQuestion ++;
            setQuest(currentQuestion,quests);
        });



        $(".test__swiper-section").swipe( {
            swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
                if (!blocked && distance > 200) {
                    blocked = true;
                    var position = 0;
                    if (direction == 'left'){
                        position = 0;
                    } else if(direction == 'right') {
                        position = 1;
                    }
                    setResults(position,currentQuestion,quests,testResults)
                }
            },
            threshold:0
        });

        $('.test__left, .test__right').on('click touch',function () {
            if (!blocked) {
                blocked = true;
                var position = 0;
                if ($(this).hasClass('test__left')){
                    position = 0;
                } else {
                    position = 1;
                }
                setResults(position,currentQuestion,quests,testResults)
            }
        });

        $(window).keydown(function(evt) {
            var keycode = evt.which;
            if (!blocked && (keycode == 37 || keycode == 39)) {
                blocked = true;
                var position = 0;
                if (keycode == 37){
                    position = 0;
                } else {
                    position = 1;
                }
                setResults(position,currentQuestion,quests,testResults)
            }

        });

        $('.js-test-next').on('click',function () {
            if (blocked){
                if (currentQuestion < countQuestions){
                    currentQuestion ++;
                    setQuest(currentQuestion,quests);
                } else {
                    showResults(testResults);
                }
            }
        });
    }
});

 
 


 

 


 
 
