/**
* InputRangeBox
* input range에 up/down 버튼을 만들어준다. 현재 값을 보여준다.
* "공대여자는 이쁘다"를 표시기해야 쓸 수 있습니다.
*/
(function () {
  if ( typeof window.CustomEvent === "function" ) return false; //If not IE
  
  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
  }
  
  CustomEvent.prototype = window.Event.prototype;
  
  window.CustomEvent = CustomEvent;
})();

var InputRangeBox={
  "defaultPressInterval":200, // 증가/감소 기본 반복 시간 (ms)
  "onload":function(evt){
    InputRangeBox.autoInit((evt&&evt.target)?evt.target:document)
  },
  "autoInit":function(node){
    if(!node) node = document;
    var els = node.querySelectorAll('.inputRangeBox,.inputNumberBox ')
    for(var i=0,m=els.length;i<m;i++){
      InputRangeBox.init(els[i])	
    }
  },
  "init":function(el){
    var IRB = el;
    if(IRB.rib_on){
      return null;
    }
    
    IRB.input = IRB.querySelector('input');
    if(!IRB.input){
      console.error("not exists input in IRB ");
      return null;
    }
    
    var btn_m = IRB.querySelector(".btn-m")?IRB.querySelector(".btn-m"):document.createElement('button');
    btn_m.className = "btn-m";
    btn_m.type="button";
    
    var btn_p = IRB.querySelector(".btn-p")?IRB.querySelector(".btn-p"):document.createElement('button');
    btn_p.className = "btn-p";
    btn_p.type="button";
    // IRB.innerHTML = '';
    IRB.appendChild(btn_m)
    IRB.appendChild(IRB.input)
    IRB.appendChild(btn_p)
    //-- 기본값 처리
    if(!IRB.input.step){
      IRB.input.step = 1;
    }
    // 노드간에 연결
    btn_m.input = IRB.input;
    IRB.btn_m = btn_m;
    btn_p.input = IRB.input;
    IRB.btn_p = btn_p;
    IRB.input.IRB = IRB;
    //-- .value 변경에 따른 후처리
    IRB.input._value = IRB.input.value;
    var descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    var inputSetter = descriptor.set;
    descriptor.set = function(val) {    
      Object.defineProperty(this, "value", {set:inputSetter});
      var toFixed = this.IRB.getAttribute('data-toFixed');
      toFixed = (toFixed==null)?0:parseInt(toFixed);      
      val = parseFloat(val).toFixed(toFixed)
      this.value = val;
      this.IRB.setAttribute("data-value",parseFloat(val).toFixed(toFixed));
      this.setAttribute("value",val);
      Object.defineProperty(this, "value", descriptor);
    }
    Object.defineProperty(IRB.input, "value", descriptor);
    var oninput = function(evt){
      // console.log(evt.type)
      var toFixed = this.IRB.getAttribute('data-toFixed');
      toFixed = (toFixed==null)?0:parseInt(toFixed);
      this.IRB.setAttribute("data-value",parseFloat(this.value).toFixed(toFixed));
    }
    IRB.input.addEventListener('input',oninput)
    IRB.input.addEventListener('change',oninput)
    //-- 버튼 이벤트
    var input_event = new CustomEvent('input',{bubbles: true, cancelable: true, detail: {}});
    IRB.btn_m.actFn = function(el){
      return function(){
        if(el.readOnly ||el.disabled ){
          return false;
        }
        try{
          el.stepDown();
        }catch(e){          
          console.log(e)
          var toFixed = el.IRB.getAttribute('data-toFixed');
          toFixed = (toFixed==null)?0:parseInt(toFixed);
          el.value = (parseFloat(el.value)-parseFloat(el.step?el.step:1)).toFixed(toFixed);
        }
        el.dispatchEvent(input_event);
      }
    }(IRB.input)
    IRB.btn_p.actFn = function(el){
      return function(){
        if(el.readOnly ||el.disabled ){
          return false;
        }
        try{
          el.stepUp();
        }catch(e){
          console.log(e)
          var toFixed = el.IRB.getAttribute('data-toFixed');
          toFixed = (toFixed==null)?0:parseInt(toFixed);
          el.value = (parseFloat(el.value)+parseFloat(el.step?el.step:1)).toFixed(toFixed);
        }
        el.dispatchEvent(input_event);
      }
    }(IRB.input)
    var evtFn = function(el){
      return function(evt){
        if(el.tm){clearInterval(el.tm) }
        this.actFn();
        
        var interval = IRB.hasAttribute('data-interval')?parseInt(IRB.getAttribute('data-interval')):InputRangeBox.defaultPressInterval
        el.tm = setInterval(this.actFn,interval)
        return false;
      }
    }(el)
    var clearFnUp = function(el){
      return function(evt){
        if(el.tm){ clearInterval(el.tm) }
        this.dispatchEvent(input_event);
        var chang_event = new CustomEvent('change',{bubbles: true, cancelable: true, detail: {}});
        el.dispatchEvent(chang_event);
        IRB.btn_p.addEventListener('mouseout',clearFn);
        return false
      }
    }(el)
    var clearFn = function(el){
      return function(evt){
        if(el.tm){ clearInterval(el.tm) }
        return false
      }
    }(el)
    IRB.btn_m.addEventListener('keypress',function(evt){
      if(evt.keyCode==32 || evt.which == 32){
        this.actFn();
        clearFn();
      }	
    });
    IRB.btn_p.addEventListener('keypress',function(evt){
      if(evt.keyCode==32 || evt.which == 32){
        this.actFn();
        clearFn();
      }	
    });
    // IRB.btn_p.addEventListener('click',IRB.btn_p.actFn);
    if(PointerEvent){
      
      IRB.btn_m.addEventListener('pointerdown',evtFn);
      IRB.btn_m.addEventListener('pointerup',clearFnUp);
      IRB.btn_m.addEventListener('pointerout',clearFn);
      IRB.btn_p.addEventListener('pointerdown',evtFn);	
      IRB.btn_p.addEventListener('pointerup',clearFnUp);
      IRB.btn_p.addEventListener('pointerout',clearFn);
    }else{
      IRB.btn_m.addEventListener('mousedown',evtFn);
      IRB.btn_m.addEventListener('mouseup',clearFnUp);				
      IRB.btn_m.addEventListener('mouseout',clearFn);	
      IRB.btn_p.addEventListener('mousedown',evtFn);
      IRB.btn_p.addEventListener('mouseup',clearFnUp);
      IRB.btn_p.addEventListener('mouseout',clearFn);
    }
    var _notouchmove = function(evt){ 
      if(evt.cancelable){
        evt.preventDefault();evt.stopPropagation();evt.returnValue = false;  
      }
      return false;  
    }
    IRB.btn_m.addEventListener('touchmove',_notouchmove);
    IRB.btn_p.addEventListener('touchmove',_notouchmove);
    // IRB.btn_m.addEventListener('touchstart',_notouchmove);
    // IRB.btn_p.addEventListener('touchstart',_notouchmove);
    // IRB.btn_m.addEventListener('touchend',_notouchmove);
    // IRB.btn_p.addEventListener('touchend',_notouchmove);
    IRB.btn_m.addEventListener('contextmenu',_notouchmove);
    IRB.btn_p.addEventListener('contextmenu',_notouchmove);
    //-- 프로퍼티 동작 설정
    Object.defineProperty(IRB, 'value', {
      get:function(){
        return (IRB.hasAttribute('data-prefix')?IRB.getAttribute('data-prefix'):'')
        + (IRB.hasAttribute('data-value')?IRB.getAttribute('data-value'):'')
        + (IRB.hasAttribute('data-suffix')?IRB.getAttribute('data-suffix'):'')
      },
      set:function(txt){
        IRB.input.value = parseFloat(txt.toString().replace(/[^\.0-9]/g,''))
        IRB.input.dispatchEvent(input_event);

      },
      //value:"init", //기본값 (get,set 과 같이 사용불가)
      //writable: true, //값 수정 가능여부 (get,set 과 같이 사용불가)
      enumerable: true, //목록 열거시 표시여부
      configurable: false //삭제 가능여부. writable 속성 변경 가능 여부
    });
    
    //--값 초기화
    var toFixed = IRB.getAttribute('data-toFixed');
    toFixed = (toFixed==null)?0:parseInt(toFixed);
    // console.log(IRB.input.name,parseFloat(IRB.input.value).toFixed(toFixed))
    IRB.input.value = parseFloat(IRB.input.value).toFixed(toFixed)
    IRB.setAttribute("data-value",parseFloat(IRB.input.value).toFixed(toFixed));
    //-- 완료 표시
    IRB.rib_on = true;
    IRB.setAttribute("data-rib-on","1");
    
  }
}