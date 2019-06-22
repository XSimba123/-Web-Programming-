

var $$ = function(sel) {
    return document.querySelector(sel);
};
var $All = function(sel) {
    return document.querySelectorAll(sel);
};

var $SON = function(father, son) {
    return father.querySelector(son);
};

var makeArray = function(likeArray) {
    var array = [];
    for (var i = 0; i < likeArray.length; ++i) {
        array.push(likeArray[i]);
    }
    return array;
};
var reverseArray = function (array) {
    var reversed = [];
    for (var i = array.length - 1; i >=0 ; --i) {
        reversed.push(array[i]);
    }
    return reversed;
};
var appendArray = function (array1, array2) {
    var appended = array1;
    for (var i = array2.length - 1; i >=0 ; --i) {
        appended.push(array2[i]);
    }
    return appended;
};


function getTop(e){
    var offset=e.offsetTop;
    if(e.offsetParent!=null) offset+=getTop(e.offsetParent);
    return offset;
}
function getLeft(e){
    var offset=e.offsetLeft;
    if(e.offsetParent!=null) offset+=getLeft(e.offsetParent);
    return offset;
}
var initMove = function(move, todo) {
    //console.log($SON(todo, '.todo-importance').value, $SON(move, '.todo-importance').value);
    $SON(move, '.item-label').innerHTML = $SON(todo, '.item-label').innerHTML;
    $SON(move, '.item-completed').checked = $SON(todo, '.item-completed').checked;
    $SON(move, '.todo-importance').value = $SON(todo, '.todo-importance').value;

};
var guid = 0;

var data = {'items':[], 'imp': 'All', 'msg':"", 'filter':"All"};
var guid = 0;
var rest = [];
var updateData = function () {
    var data = model.data;
    data.items=[];
    var _todos = makeArray($All('.todo-item'));
    _todos.forEach(function (t) {
        var msg = $SON(t, '.item-label').innerHTML;
        var completed = $SON(t, '.item-completed').checked;
        var imp = $SON(t, '.todo-importance').value;
        data.items.push({'id':t.id,'msg': msg, 'importance': imp, 'completed': completed});
    });
    data.items = reverseArray(data.items);
    data.items = appendArray(data.items, rest);
    model.flush();
};

var isWriting = 0;
var finished = false;

var refresh = function(){
    model.flush();
    var data = model.data;
    rest = [];
    var todoList = $$('.todo-list');
    todoList.innerHTML = [
        '<li>',
        '  <div class="move-item">',
        '    <input class="item-completed" type="checkbox">',
        '    <label class="item-label">新消息</label>',
        '    <select class="todo-importance">',
        '      <option value="绿">普通</option>',
        '      <option value="黄">重要</option>',
        '      <option value="红">紧急</option>',
        '    </select>',
        '  </div>',
        '</li>'
    ].join('');

    var move = $$('.move-item');
    move.style.visibility = 'hidden';
    for(var i = 0; i < data.items.length; i++){
        var todoItem = document.createElement('li');

        var completeCheck = function (nowItem) {
            if(nowItem.completed)return ' checked="checked"';
            else return '';
        };

        var completeCSS = function (nowItem) {
            if(nowItem.completed)return ' complete"';
            else return '"';
        };

        var importanceChosen = function (nowItem, choice) {
            if(nowItem.importance === choice)return 'selected = "selected"';
            else return "";
        };

        var importanceBG = function (nowItem) {
            if(nowItem.importance === '绿')return " green";
            else if(nowItem.importance === '红')return " red";
            else return " yellow"
        };

        if((data.filter === "All"||(data.items[i].completed && data.filter === 'Completed')||
            (!data.items[i].completed && data.filter === 'Active'))&&(data.imp === 'All'||
            data.items[i].importance === data.imp)){
            todoItem.innerHTML = [
                '<div class="todo-item'+importanceBG(data.items[i])+'" id="'+ toString(data.items[i].id)+'">',
                '  <input class="item-completed" type="checkbox"'+completeCheck(data.items[i])+'>',
                '  <label class="item-label'+completeCSS(data.items[i])+'>' + data.items[i].msg + '</label>',
                '  <select class="todo-importance">',
                '    <option value="绿"'+importanceChosen(data.items[i], '绿')+'>普通</option>',
                '    <option value="黄"'+importanceChosen(data.items[i], '黄')+'>重要</option>',
                '    <option value="红"'+importanceChosen(data.items[i], '红')+'>紧急</option>',
                '  </select>',
                '</div>'
            ].join('');
            //item.setAttribute('id', id);
            var item = $SON(todoItem, '.todo-item');
            //console.log(toString(data.items[i].id));
            item.setAttribute('id', 'item' + data.items[i].id);
            var cbox = $SON(item, '.item-completed');
            //item.setAttribute('id', id);
            var label = $SON(item, '.item-label');
            var originTouch;
            var oldTouch;
            var longClick;
            var timeOutEvent;
            touchHandler = {
                start: function(ev) {
                    ev.preventDefault();
                    longClick=0;//设置初始为0
                    var obj = ev.srcElement ? ev.srcElement : ev.target;
                    if(obj.id[0] !== 'i'){
                        obj = obj.parentNode;
                    }
                    timeOutEvent = setTimeout(function(){
                        isWriting = obj.id;
                        edit = $$('.edit');
                        finished = false;
                        edit.style.width = obj.offsetWidth+"px";
                        edit.style.visibility = 'visible';
                        edit.style.left = getLeft(obj)+"px";
                        edit.style.top = getTop(obj)+"px";
                        edit.value = $SON(obj,'.item-label').innerHTML;
                        edit.focus();
                        longClick=1;
                    },1000);
                    originTouch = ev.touches[0];
                    oldTouch = ev.touches[0];

                },
                move: function(ev) {
                    ev.preventDefault();
                    clearTimeout(timeOutEvent);
                    timeOutEvent = 0;
                    var obj = ev.srcElement ? ev.srcElement : ev.target;
                    if(obj.id[0] !== 'i')obj=obj.parentNode;
                    if(move.style.visibility === 'hidden'){
                        var _style = obj.style;
                        move.style.left = getLeft(obj) + "px";
                        move.style.top = getTop(obj) + "px";
                        move.style.visibility = 'visible';
                        _style.visibility = "hidden";
                        move.style.width = obj.offsetWidth+"px";

                        initMove(move, obj);
                    }


                    var newTouch = ev.touches[0];
                    var style = move.style;
                    var left =
                        parseFloat(style.left || 0) +
                        (newTouch.clientX - oldTouch.clientX) +
                        "px";
                    var top =
                        parseFloat(style.top || 0) + (newTouch.clientY - oldTouch.clientY) + "px";
                    oldTouch = ev.touches[0];
                    var todos = makeArray($All('.todo-item'));
                    todos.forEach(function (t) {
                        if(obj !== t){
                            if(getTop(move)-getTop(t)<=5 && getTop(move)-getTop(t) >= -5){
                                if(getTop(obj)<getTop(t)){
                                    $("#"+t.id).after($("#"+obj.id));
                                }
                                else{
                                    $("#"+obj.id).after($("#"+t.id));
                                }
                            }
                        }
                    });
                    //console.log(ev.type, left, top);
                    style.left = left;
                    style.top = top;
                },
                end: function(ev) {
                    ev.preventDefault();
                    clearTimeout(timeOutEvent);
                    if(timeOutEvent!=0 && longClick===0){

                    }
                    //return false;
                    var newTouch = ev.changedTouches[0];
                    var obj = ev.srcElement ? ev.srcElement : ev.target;
                    if(obj.id[0] !== 'i')obj=obj.parentNode;
                    if(newTouch.clientX-originTouch.clientX >=120){
                        console.log(1);
                        $("#"+obj.id).remove();
                    }
                    if(newTouch.clientX-originTouch.clientX <= -120){
                        console.log($SON(obj,'.item-completed').checked);
                        if($SON(obj,'.item-completed').checked){
                            $SON(obj,'.item-completed').removeAttribute("checked");
                            console.log($SON(obj,'.item-completed').checked);
                        }
                        else {
                            console.log("false");
                            $SON(obj,'.item-completed').setAttribute('checked', true);}
                        updateData();
                        refresh();
                    }
                    var style = obj.style;
                    style.visibility = "visible";
                    move.style.visibility = "hidden";
                    updateData();
                },
                cancel: function(ev) {
                    ev.preventDefault();
                    clearTimeout(timeOutEvent);
                    if (timeOutEvent != 0 && longClick === 0) {

                    }
                    //return false;
                    var newTouch = ev.changedTouches[0];
                    var obj = ev.srcElement ? ev.srcElement : ev.target;
                    if (obj.id[0] !== 'i') obj = obj.parentNode;
                    if (newTouch.clientX - originTouch.clientX >= 120) {
                        console.log(1);
                        $("#" + obj.id).remove();
                    }
                    if (newTouch.clientX - originTouch.clientX <= -120) {
                        console.log($SON(obj, '.item-completed').checked);
                        if ($SON(obj, '.item-completed').checked) {
                            $SON(obj, '.item-completed').removeAttribute("checked");
                            console.log($SON(obj, '.item-completed').checked);
                        } else {
                            console.log("false");
                            $SON(obj, '.item-completed').setAttribute('checked', true);
                        }
                        updateData();
                        refresh();
                    }
                    var style = obj.style;
                    style.visibility = "visible";
                    move.style.visibility = "hidden";
                    updateData();
                }
            };

            item.addEventListener("touchstart", touchHandler.start, false);
            item.addEventListener("touchmove", touchHandler.move, false);
            item.addEventListener("touchend", touchHandler.end);
            item.addEventListener("touchcancel", touchHandler.cancel);

            var checkbox = $SON(todoItem, '.item-completed');
            checkbox.addEventListener('change', function () {
                updateData();
                refresh();
            });

            var imp = $SON(todoItem, '.todo-importance');
            imp.addEventListener('change', function () {
                updateData();
                refresh();
            });
            todoList.insertBefore(todoItem, todoList.firstChild);
        }
        else{
            rest.push(data.items[i]);
        }

    }

};



window.onload = function () {
    model.init(function () {
        var data = model.data;

        var filters = makeArray($All('.filters li a'));
        filters.forEach(function (f) {
            if(f.innerHTML == data.filter){
                f.style.color="red";
            }
            else f.style.color="black";
        });


        refresh();
        var addText = $$('.add');
        var importance = $$('.importance');
        var finishAll = $$('.finish-all');
        var filters = $$('.filters');
        var move = $$('.move-item');
        var clearComplete = $$(".clear-completed");
        var edit = $$('.edit');
        var list = $$('.todo-list');
        var sort = $$('.sort');
        move.style.visibility = 'hidden';
        console.log(data.filter);
        addText.addEventListener('change', function () {
            data.msg = addText.value;
            model.flush();
        });
        addText.addEventListener('keyup', function (ev) {
            if(ev.keyCode !== 13){
                data.msg = addText.value;
                model.flush();
            }
        });
        importance.value = model.data.imp;

        var addTouch;
        addText.addEventListener('touchstart', function (ev) {
            addTouch = ev.touches[0];
        });
        addText.addEventListener('touchmove', function (ev) {
            ev.preventDefault();
            var newTouch = ev.touches[0];

            if(newTouch.clientY - addTouch.clientY >= 60){

                if(list.firstChild.id !==  'additem'){
                    var addItem = document.createElement('li');
                    addItem.setAttribute('id','additem');
                    addItem.innerHTML = [
                        '<div class="add-item">',
                        '      <span class="em">+new:</span>',
                        '      <label class="item-label">' + '  '+data.msg + '</label>',
                        '</div>'
                    ].join('');
                    list.insertBefore(addItem, list.firstChild);
                }
            }
            else{
                if(list.firstChild.id ===  'additem'){
                    if($SON(list, '#additem') !== null){
                        list.removeChild($SON(list, '#additem'));
                    }
                }
            }
        });
        addText.addEventListener('touchend', function (ev) {
            var newTouch = ev.changedTouches[0];
            if($SON(list, '#additem') !== null){
                list.removeChild($SON(list, '#additem'));
            }
            if(newTouch.clientY - addTouch.clientY >= 30){
                if (data.msg === '') {
                    console.warn('input msg is empty');
                    return;

                }
                if(data.imp === "All") data.items.push({'id':guid++,'msg': data.msg, 'importance': '绿', 'completed': false});
                else data.items.push({'id':guid++,'msg': data.msg, 'importance': data.imp, 'completed': false});
                refresh();
                data.msg = '';
                addText.value='';
            }
        });





        importance.addEventListener('change', function () {
            data.imp = importance.value;
            model.flush();
            refresh();
        });

        finishAll.addEventListener('change', function () {

            if(finishAll.checked){
                //console.log(1);
                data.items.forEach(function (it) {
                    console.log(it.completed);
                    it.completed = true;
                });

            }
            else{
                //console.log(0);
                data.items.forEach(function (it) {
                    it.completed = false;
                });
            }
            refresh();
        });
        clearComplete.addEventListener('click', function () {
            copy=[];
            data.items.forEach(function (it) {
                if(!it.completed){
                    copy.push(it);
                }
            });
            data.items=copy;
            refresh();
        });

        var filters = makeArray($All('.filters li a'));
        filters.forEach(function(filter) {
            filter.addEventListener('click', function() {
                data.filter = filter.innerHTML;
                var filters = makeArray($All('.filters li a'));
                filters.forEach(function (f) {
                    f.style.color="black";
                });
                this.style.color="red";
                refresh();
            }, false);
        });




        function finish() {
            if (finished) return;
            finished = true;
            edit.style.visibility = 'hidden';
            isWriting = 0;
        }

        edit.addEventListener('blur', function() {
            $SON($$('#'+isWriting), '.item-label').innerHTML = this.value;
            isWriting = 0;
            finish();
            updateData();
            refresh();
            finish();
        }, false);

        sort.addEventListener('click', function () {
            console.log('666');
            data.items.sort(function(prev, after){
                if(prev.msg < after.msg)
                    return 1;  //返回大于0，则prev与after交换
                else if(prev.msg === after.msg)
                    return 0;  //0 ，则相等,不交换
                else
                    return -1; //返回小于0，不交换
            });
            refresh();
        });
    });


};