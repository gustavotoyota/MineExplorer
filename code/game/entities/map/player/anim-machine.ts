import { StateMachine } from "~/code/game/state-machine";
import { IVec3 } from "~/code/misc/vec3";

export type PlayerWalkData =
  | {
      sourcePos: IVec3;
      targetPos: IVec3;
      targetIsObstacle: boolean;
      startTime: number;
      endTime: number;
    }
  | undefined;

export function isPlayerWalking(input: {
  walkData: PlayerWalkData;
  currentTime: number;
}): boolean {
  return input.walkData != null && input.currentTime < input.walkData.endTime;
}

export interface PlayerAnimData {
  hp: number;
  maxHP: number;

  worldPos: IVec3;

  currentTime: number;

  walking?: PlayerWalkData;
}

export function createPlayerAnimMachine(input: {
  playerHP: Ref<number>;
  playerMaxHP: Ref<number>;
  currentTime: Ref<number>;
  playerWalking: Ref<PlayerWalkData>;
  worldPos: Ref<IVec3>;
}) {
  return new StateMachine<PlayerAnimData>({
    initialState: ref("idle-down"),
    data: ref({
      hp: input.playerHP,
      maxHP: input.playerMaxHP,

      worldPos: input.worldPos,

      currentTime: input.currentTime,

      walking: input.playerWalking,
    }),
    transitions: [
      {
        condition: ({ state, data }) =>
          state.startsWith("idle") &&
          data.walking != null &&
          data.currentTime < data.walking.endTime,
        to: ({ data }) => {
          if (data.walking == null) {
            throw new Error("Walking is null");
          }

          const prefix = data.walking.targetIsObstacle ? "mine" : "walk";

          if (data.walking.targetPos.x < data.worldPos.x) {
            return `${prefix}-left`;
          } else if (data.walking.targetPos.x > data.worldPos.x) {
            return `${prefix}-right`;
          } else if (data.walking.targetPos.y < data.worldPos.y) {
            return `${prefix}-up`;
          } else {
            return `${prefix}-down`;
          }
        },
      },
      {
        condition: ({ state, data }) =>
          state.startsWith("walk") ||
          (state.startsWith("mine") &&
            (data.walking == null || data.currentTime >= data.walking.endTime)),
        to: ({ prevState }) => `idle-${prevState.slice(5)}`,
      },
    ],
  });
}
