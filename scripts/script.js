const Scene = require('Scene');
const Reactive = require('Reactive');
export const Diagnostics = require('Diagnostics');
const FaceTracking = require('FaceTracking');
const Animation = require('Animation');
const Time = require('Time');
const Random = require('Random');
const CameraInfo = require('CameraInfo');

// Importing Gameobjects

const player = Scene.root.find('plane0');
const canvas = Scene.root.find('canvas0');
const box = Scene.root.find('box0');
const boom = Scene.root.find('rectangle0');
const conor = Scene.root.find('rectangle1');
const text = Scene.root.find('text');
const text1 = Scene.root.find('text1');
const text2 = Scene.root.find('text2');
const text3 = Scene.root.find('text3');

boom.hidden = true;
conor.hidden = true;
text3.hidden = true;


// Counting the scale of boxes
// Setting needed size of boxes

const WC = canvas.transform.scaleX.pinLastValue();
const w = canvas.width.pinLastValue();
const h = canvas.height.pinLastValue();
const w1 = box.width.pinLastValue();
const h1 = box.height.pinLastValue();

const box_a = w1 / WC;
const row_length = 7;
const box_a_new = w / row_length;
const coefficient = box_a_new / box_a;

box.transform.scaleX = Reactive.val(coefficient);
box.transform.scaleY = Reactive.val(coefficient);

// Creatig array of boxes

const names = [];
const rows_amount = 3;
const number = rows_amount*row_length;
const boxes = [];

// Creating boxes
for (let j = 0; j < rows_amount; j++){
  names.push([]);
  boxes.push([]);
  for (let i = 0; i < row_length; i++){
    names[j][i] = 'box' + (j * row_length + i);
    boxes[j].push(Scene.root.find(names[j][i]));
  }
}

// Placing our boxes

for (let j = 0; j < rows_amount; j++){
  for (let i = 0; i < row_length; i++){
    boxes[j][i].transform.x = w*WC*(-0.5 + 1/(2*(row_length)) + i*(1 / row_length));
    boxes[j][i].transform.y = boxes[j][0].transform.y;
    boxes[j][i].transform.z = 0;
    boxes[j][i].transform.scaleX = coefficient;
    boxes[j][i].transform.scaleY = coefficient;
  }
}

// Function of distance

function dist(a, b){
  return ((a.transform.x.sub(b.transform.x)).pow(2).add((a.transform.y.sub(b.transform.y)).pow(2)).pow(1/2));
}

// Animation for the first row to go down

const time_going_down = 3000;
const timeDriverParameters = {
  durationMilliseconds: time_going_down,
  loopCount: Infinity,
  mirror: false
};

const linearSampler = Animation.samplers.linear(h*WC*(0.5+0.1), h*WC*(-0.5-0.1));

const timeDriver_array = [];
for (let i = 0; i < rows_amount; i++){
  timeDriver_array.push(Animation.timeDriver(timeDriverParameters));
  boxes[i][0].transform.y = Animation.animate(timeDriver_array[i], linearSampler);
}

// Animation for other rows

var a = 0;
var b = 0;

function drive() {
  timeDriver_array[a].start();
  a = a + 1;
}

// Is recording video

const is_recording = CameraInfo.isRecordingVideo;
is_recording.monitor().subscribe(function(event){
  const intervalTimer = Time.setInterval(drive, time_going_down / rows_amount);
  const hidingTimer = Time.setInterval(hide, time_going_down / rows_amount);
  text.hidden = false;
  text2.hidden = true;
  face_bug();
  const endTimer = Time.setInterval(winner, 55000);
})

function stopIntervalTimer(){
  Time.clearInterval(intervalTimer);
}

const timeoutTimer = Time.setTimeout(stopIntervalTimer, time_going_down * 1.05);

// Hiding boxes

const condition_array = [];
const hiddens_array = [];
for (let i = 0; i < rows_amount; i++){
  condition_array.push(true);
  hiddens_array.push(0);
}

function hide(){
  if (FaceTracking.count.pinLastValue() == 0){
    end_game();
  }
  if (condition_array[b]){
    hiddens_array[b] = Math.ceil(Random.random()*row_length) - 1;
    boxes[b][hiddens_array[b]].hidden = true;
    condition_array[b] = false;
  }
  else{
    boxes[b][hiddens_array[b]].hidden = false;
    hiddens_array[b] = Math.ceil(Random.random()*row_length) - 1;
    boxes[b][hiddens_array[b]].hidden = true;
  }
  main_changing();
  b = b + 1;
  b = b % (rows_amount);
}

function main_changing(){
  if (b == 0){
  main0 = player.transform.y.sub(boxes[0][0].transform.y).abs().sub(radius).lt(0).and(player.transform.x.sub(boxes[0][hiddens_array[0]].transform.x).abs().gt(radius));}
  else if (b == 1){
  main1 = player.transform.y.sub(boxes[1][0].transform.y).abs().sub(radius).lt(0).and(player.transform.x.sub(boxes[1][hiddens_array[1]].transform.x).abs().gt(radius));}
  else{
  main2 = player.transform.y.sub(boxes[2][0].transform.y).abs().sub(radius).lt(0).and(player.transform.x.sub(boxes[2][hiddens_array[2]].transform.x).abs().gt(radius));}
}

// Colliding player with walls
// Creating array of game_conditions

const radius = dist(boxes[0][0], boxes[0][1]).div(2);
var main0 = player.transform.y.sub(boxes[0][0].transform.y).abs().sub(radius).lt(0).and(player.transform.x.sub(boxes[0][hiddens_array[0]].transform.x).abs().sub(radius).gt(0));
var main1 = player.transform.y.sub(boxes[1][0].transform.y).abs().sub(radius).lt(0).and(player.transform.x.sub(boxes[1][hiddens_array[1]].transform.x).abs().gt(radius));
var main2 = player.transform.y.sub(boxes[2][0].transform.y).abs().sub(radius).lt(0).and(player.transform.x.sub(boxes[2][hiddens_array[2]].transform.x).abs().gt(radius));

player.transform.x.monitor().subscribe(function(event){
  if (main0.pinLastValue() || main1.pinLastValue() || main2.pinLastValue()){
    end_game();
  }
})

// Text panel

text.text = 'Points: 0';
text.hidden = true;

// Counting player's score

var score = 0;

var score0 = player.transform.y.gt(boxes[0][0].transform.y);
var counter0 = 0;
score0.monitor().subscribe(function(event){
  if (counter0 % 2 == 0){
    score = score + 1;
    text.text = 'Points: ' + score;
  }
  counter0 = counter0 + 1;
})

var score1 = player.transform.y.gt(boxes[1][0].transform.y);
var counter1 = 0;
score1.monitor().subscribe(function(event){
  if (counter1 % 2 == 0){
    score = score + 1;
    text.text = 'Points: ' + score;
  }
  counter1 = counter1 + 1;
})

var score2 = player.transform.y.gt(boxes[2][0].transform.y);
var counter2 = 0;
score2.monitor().subscribe(function(event){
  if (counter2 % 2 == 0){
    score = score + 1;
    text.text = 'Points: ' + score;
  }
  counter2 = counter2 + 1;
})

// Face got out of screen

function face_bug(){
  FaceTracking.count.monitor().subscribe(function(event){
    end_game();
  });
}

// Game over

var final_score;
var end_game_condition = true;
function end_game(){
  if (end_game_condition){
    end_game_condition = false;
    player.hidden = true;
    for (let j = 0; j < rows_amount; j++){
      for (let i = 0; i < row_length; i++){
        boxes[j][i].hidden = true;
      }
    }
    boom.hidden = false;
    text.hidden = true;
    final_score = score;
    text1.text = array_of_losers[Math.ceil(Random.random()*array_of_losers.length) - 1] + ' Move forward! You have only: ';
    text3.text = '' + final_score;
    text3.hidden = false;
  }
}

var array_of_winner = ['Yes! You did it!', 'Easy peasy!', 'Good job!', '@marklitvinov was here..', 'Booom!', 'YOU are the winner here!', '239239239239239239!', 'That is brilliant!'];
var array_of_losers = ['Awful!', 'BAD!!!', 'Bad loser!', 'There is no winner and loser here.', 'Dont be a sore loser!', 'Failure defeats losers, failure inspires winners.', 'Losers quit when theyre tired. Winners quit when theyve won!', 'All haters are losers, even when they win.', 'Win. No one remembers the losers.', 'Winners focus on winning. Losers focus on winners.', 'Obstacles are challenges for winners and excuses for losers.', 'If youre not big enough to lose, youre not big enough to win!', ' Failure defeats losers but inspires winners!', 'That is no good..'];

function winner(){
    if (end_game_condition){
      end_game_condition = false;
      player.hidden = true;
      text.hidden = true;
      final_score = score;
      text1.text = array_of_winner[Math.ceil(Random.random()*array_of_winner.length) - 1] + ' Points the Winner got: ';
      text3.text = '' + final_score;
      text3.hidden = false;
      conor.hidden = false;
    }
}

// Moving our player

player.transform.x = FaceTracking.face(0).cameraTransform.x;
player.transform.y = FaceTracking.face(0).cameraTransform.y;
player.transform.z = 0.01;
player.transform.scaleX = 0.2;
player.transform.scaleY = 0.4;
