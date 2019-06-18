/// <reference path="./typings/altv-client.d.ts" />

import * as alt     from 'alt'
import * as natives from 'natives'
import $            from '../lib/altv-api/client/index.js';

const { joaat, delay, waitFor }  = $.utils;
const { fadeIn, fadeOut }        = $.helpers;
const { Model, Camera }          = $.types;
const { Vector3 }                = $.math;
const { INPUT_GROUPS, CONTROLS } = $.constants;

let freeCamEnabled = false;
let camera         = null;

function freeCamTick() {

  natives.disableControlAction(INPUT_GROUPS.MOVE, CONTROLS.MOVE_LR, true);
  natives.disableControlAction(INPUT_GROUPS.MOVE, CONTROLS.MOVE_UD, true);
  natives.disableControlAction(INPUT_GROUPS.MOVE, CONTROLS.LOOK_LR, true);
  natives.disableControlAction(INPUT_GROUPS.MOVE, CONTROLS.LOOK_UD, true);
  natives.disableControlAction(INPUT_GROUPS.MOVE, CONTROLS.AIM, true);
  natives.disableControlAction(INPUT_GROUPS.MOVE, CONTROLS.VEH_MOUSE_CONTROL_OVERRIDE, true);

  natives.disableControlAction(INPUT_GROUPS.MOVE, CONTROLS.ATTACK, true);
  natives.disableControlAction(INPUT_GROUPS.MOVE, CONTROLS.MELEE_ATTACK_LIGHT, true);
  natives.disableControlAction(INPUT_GROUPS.MOVE, CONTROLS.MELEE_ATTACK_HEAVY, true);
  natives.disableControlAction(INPUT_GROUPS.MOVE, CONTROLS.MELEE_ATTACK_ALTERNATE, true);
  natives.disableControlAction(INPUT_GROUPS.MOVE, CONTROLS.ATTACK2, true);
  natives.disableControlAction(INPUT_GROUPS.MOVE, CONTROLS.MELEE_ATTACK1, true);
  natives.disableControlAction(INPUT_GROUPS.MOVE, CONTROLS.MELEE_ATTACK2, true);

  natives.disableControlAction(INPUT_GROUPS.MOVE, CONTROLS.WEAPON_WHEEL_UD, true);
  natives.disableControlAction(INPUT_GROUPS.MOVE, CONTROLS.WEAPON_WHEEL_NEXT, true);
  natives.disableControlAction(INPUT_GROUPS.MOVE, CONTROLS.WEAPON_WHEEL_PREV, true);
  natives.disableControlAction(INPUT_GROUPS.MOVE, CONTROLS.SELECT_NEXT_WEAPON, true);
  natives.disableControlAction(INPUT_GROUPS.MOVE, CONTROLS.SELECT_PREV_WEAPON, true);

  let camCoords       = camera.position;
  const right         = camera.rightVector;
	const forward       = camera.forwardVector;
	let speedMultiplier = null;

  if(natives.isControlPressed(INPUT_GROUPS.MOVE, CONTROLS.SPRINT))
		speedMultiplier = 8.0;
	else if(natives.isControlPressed(INPUT_GROUPS.MOVE, CONTROLS.CHARACTER_WHEEL))
		speedMultiplier = 0.025;
	else
		speedMultiplier = 0.25;

	if(natives.isControlPressed(INPUT_GROUPS.MOVE, CONTROLS.MOVE_UP_ONLY)) {
		camera.position = camCoords.clone().add(forward.clone().scale(speedMultiplier));
  }

	if(natives.isControlPressed(INPUT_GROUPS.MOVE, CONTROLS.MOVE_DOWN_ONLY)) {
		camera.position = camCoords.clone().add(forward.clone().scale(-speedMultiplier));
  }

  if(natives.isControlPressed(INPUT_GROUPS.MOVE, CONTROLS.MOVE_LEFT_ONLY)) {
		camera.position = camCoords.clone().add(right.clone().scale(-speedMultiplier));
  }

	if(natives.isControlPressed(INPUT_GROUPS.MOVE, CONTROLS.MOVE_RIGHT_ONLY)) {
		camera.position = camCoords.clone().add(right.clone().scale(speedMultiplier));
  } 

	const xMagnitude = natives.getDisabledControlNormal(INPUT_GROUPS.MOVE, CONTROLS.LOOK_LR);
	const yMagnitude = natives.getDisabledControlNormal(INPUT_GROUPS.MOVE, CONTROLS.LOOK_UD);
	const camRot     = camera.rotation;

	camRot.x = camRot.x - yMagnitude * 10;
	camRot.z = camRot.z - xMagnitude * 10;

	if(camRot.x < -75.0) camRot.x = -75.0;
	if(camRot.x > 100.0) camRot.x = 100.0;

  camera.rotation = camRot;

  camCoords = camera.position;

  natives.setFocusArea(camCoords.x, camCoords.y, camCoords.z, 0.0, 0.0, 0.0)
  natives.setHdArea(camCoords.x, camCoords.y, camCoords.z, 30.0);
}

function enableFreeCam() {

  alt.log('enable freecam');

  freeCamEnabled = true;
  camera         = Camera.create($.game.camera.position, $.game.camera.rotation, $.game.camera.fov);

  camera.render(true);

  $.game.on('tick', freeCamTick);
}

function disableFreeCam() {
  
  alt.log('disable freecam');

  $.game.removeListener('tick', freeCamTick);

  $.game.player.ped.position = camera.position;
  
  camera.render(false);
  camera.destroy();

  camera = null;

  natives.clearHdArea();
  natives.clearFocus();

  freeCamEnabled = false;
}

function toggleFreeCam() {

  if(freeCamEnabled)
    disableFreeCam();
  else
    enableFreeCam();
}

alt.on('consoleCommand', (command, ...args) => {

  try {

    switch(command) {

      case 'pos' : {
        
        if(camera === null)
          alt.log(`${$.game.player.ped.position.x.toFixed(3)} ${$.game.player.ped.position.y.toFixed(3)} ${$.game.player.ped.position.z.toFixed(3)}`);
        else
          alt.log(`${camera.position.x.toFixed(3)} ${camera.position.y.toFixed(3)} ${camera.position.z.toFixed(3)}`);

        break;
      }
  
      case 'tp' : {
  
        if(args.length === 3) {
          const floats               = args.map(e => parseFloat(e));
          const position             = new Vector3(floats[0], floats[1], floats[2]);
          

          if(camera === null)
            $.game.player.ped.position = position;
          else
            camera.position = position;
        }

        break;
      }
  
      case 'freecam' : {
        toggleFreeCam();
        break;
      }
  
      default: break;
  
    }

  } catch(e) { alt.logError(e); }

});