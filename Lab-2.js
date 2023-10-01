// Canvas variables
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');
ctx.font = "25px Arial";

// Positioning Variables
// X: 0-3 , Y: 0-5
let W = canvas.width/4, H = canvas.height/6, p = 0.8;
let screen_color = 'blue', button_color = 'yellow', text_color = 'black';

// Drawing Functions
function Draw_Rect(x,y,w,h,c) {
  ctx.fillStyle = c;
  ctx.fillRect(x*W,y*H,w*W*p,h*H*p);
}

function Draw_Text(x,y,a,m,d=true){
  ctx.fillStyle = text_color;
  ctx.textAlign = a;
  ctx.fillText(m,(x+0.5)*W,(y+0.5)*H);
}
 
//Action Type Variables
const Numbers = ["0","1","2","3","4","5","6","7","8","9"];
const Notation = ["+/-","."];
const Operations = ["+","-","/","X"];
const Specials = ["DEL","=","AC"];
//const Action_Types = [Numbers,Notation,Operations,Specials];

// (Screen) Displays numerical values and stores actions
class Screen {
  constructor(x,y,w,h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = screen_color;
    this.Action_Stack = ["0"];
  }
  Text_Write(D=true) {
    let message = this.Action_Stack[this.Action_Stack.length-1];
    Draw_Text((this.x+this.w)*0.7,this.y,'right',message);
  }
  Draw() {
    Draw_Rect(this.x,this.y,this.w,this.h,this.color);
    this.Text_Write();
    
  }
  Action_Type(action) {
    if(Numbers.includes(action)) {
      return 0;
    } else if(Notation.includes(action)) {
      return 1;
    } else if (Operations.includes(action)) {
      return 2;
    } else if(Specials.includes(action)) {
      return 3;
    } else {
      return "null";
    }
  }
  Clear_Stack(type) {
    switch(type) {
    
      case "DEL":
        
        if(this.Action_Stack[this.Action_Stack.length-1].length > 1) {
          this.Action_Stack[this.Action_Stack.length-1] = this.Action_Stack[this.Action_Stack.length-1].substring(0,this.Action_Stack[this.Action_Stack.length-1].length-1);
        } else {
          this.Action_Stack.length -= 1;
        }
        
        if(this.Action_Stack.length == 0) {
          this.Action_Stack = ["0"];
        }
        
        break;
      
      case "=": 
        let ans = Number(this.Action_Stack[0]);
        for(let i = 1; i < this.Action_Stack.length; i+=2) {
          if(this.Action_Stack[i] == "+") {
             ans += Number(this.Action_Stack[i+1]);
          } else if(this.Action_Stack[i] == "-") {
             ans -= Number(this.Action_Stack[i+1]);
          } else if(this.Action_Stack[i] == "/") {
             ans /= Number(this.Action_Stack[i+1]);
          } else if(this.Action_Stack[i] == "X") {
             ans *= Number(this.Action_Stack[i+1]);
          }
        }
       
        this.Action_Stack = [ans.toString()];
        break;
      case "AC":
        this.Action_Stack = ["0"];
        break;
    }
  }
  Write_Stack(action) {
    let last_value = this.Action_Stack.length-1;
    let latest_number_place = 0;
    for(let i = this.Action_Stack.length-1; i >= 0; i--) {       
      if(!(isNaN(Number(this.Action_Stack[i])))) {
            latest_number_place = i;
            break;
          }
    }
   
    Draw_Rect(this.x,this.y,this.w,this.h,this.color);
    switch(this.Action_Type(action)) {
       case 0:
        // Number
        if(isNaN(Number(this.Action_Stack[last_value]))) {
          this.Action_Stack.push("0");
          last_value = this.Action_Stack.length-1;
          latest_number_place = last_value;
        }
        if(this.Action_Stack[last_value] == "0") {
          this.Action_Stack[last_value] = action;
        } else {
          this.Action_Stack[last_value] += action;
        }
        
        break;
     
       case 1:
        // Notation ["+/-","."];
        if (action == "+/-") {
          if(this.Action_Stack[latest_number_place].slice(0,1) == "-") {
            this.Action_Stack[latest_number_place] = this.Action_Stack[latest_number_place].slice(1,this.Action_Stack[latest_number_place].length-1);
          } else {
            this.Action_Stack[latest_number_place] = "-" + this.Action_Stack[latest_number_place];
          }
        } else if (action == ".") {
          if(!(this.Action_Stack[latest_number_place].includes("."))) {
            this.Action_Stack[latest_number_place] += ".";
          }
        }
        
        break;
        
       case 2:
        // Operation
        if(!(this.Action_Type(this.Action_Stack[last_value]) == 2)) {
          this.Action_Stack.push(action);
          last_value = this.Action_Stack.length-1;
        }
       
        break;
        
       case 3:
        // Special
        this.Clear_Stack(action);
        
        break;
    }
    this.Text_Write();
  }
}

// (Button) Allows user to input actions through mouse clicks
class Button {
  constructor(x,y,w,h,a) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = button_color;
    this.action = a;
  }
  
   Text_Write() {
    Draw_Text(this.x,this.y,'center',this.action);
   }
    
  Draw() {
    Draw_Rect(this.x,this.y,this.w,this.h,this.color);
    this.Text_Write();
  }
  
  Bounding_Box(m_x,m_y) {
    let ans = false;
    if((m_x > this.x*W && m_x < this.x*W + this.w*W*p) && (m_y > this.y*H && m_y < this.y*H + this.h*H*p)) {
      ans = true;
    }
    return ans;
  }
  
  Run_Action(sc) {
    sc.Write_Stack(this.action);
  }
}  

// Calculator Button Layout
const Calculator_Map = [
  [0,0,(4/p),1,"Screen"],
  [0,1,1,1,"AC"], [1,1,1,1,"DEL"],[2,1,1,1,"+/-"],[3,1,1,1,"/"],
  [0,2,1,1,"7"], [1,2,1,1,"8"], [2,2,1,1,"9"], [3,2,1,1,"X"],
  [0,3,1,1,"4"], [1,3,1,1,"5"], [2,3,1,1,"6"], [3,3,1,1,"-"],
  [0,4,1,1,"1"], [1,4,1,1,"2"], [2,4,1,1,"3"], [3,4,1,1,"+"],
  [0,5,2,1,"0"], [2,5,1,1,"."], [3,5,1,1,"="]
]

// Calculator Object List
const Object_List = [];

// Object Initiator & Drawing Loops
for(let i = 0; i<Calculator_Map.length; i++) {
  if(Calculator_Map[i][4] == "Screen") {
    Object_List.push(new Screen(Calculator_Map[i][0],Calculator_Map[i][1],Calculator_Map[i][2],Calculator_Map[i][3]));
  } else {
    Object_List.push(new Button(Calculator_Map[i][0],Calculator_Map[i][1],Calculator_Map[i][2],Calculator_Map[i][3],Calculator_Map[i][4]));
  }
}

for(let i = 0; i<Object_List.length; i++) {
  Object_List[i].Draw();
}

// Mouse Click Function; Run button operation if a button was clicked
function MouseClick(event) {
  let m_x = event.clientX - canvas.offsetLeft;
  let m_y = event.clientY - canvas.offsetTop;
  alert(Object_List[0].Action_Stack);
  for(let i = 1; i<Object_List.length; i++) {
    if(Object_List[i].Bounding_Box(m_x,m_y)) {
      Object_List[i].Run_Action(Object_List[0]);
    }
  }
}

