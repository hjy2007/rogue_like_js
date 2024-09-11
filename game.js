import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Player {
  constructor() {
    this.hp = 100;
    this.atk = 10;
    this.canrun = 20;
    this.def = 10;
  }

  attack(hp) {
    // 플레이어의 공격
    // 해당 class를 통해 생성된 객체의 atk 가 별도의 hp에 공격을 가하는 방식
    // 이 함수가 끝나면 다시 감소된 몬스터 hp가 나가야함
    let monsterhp;

    monsterhp = hp - this.atk;

    return monsterhp;
  }

  defence(monsteratk) {
    // 몬스터 공격을 받아서 공격력을 방어력 만큼 깎아서 받으면 됨
    // 만약 방어력이 상대 공격력 보다 높으면 0받게
    if (this.def >= monsteratk) {
      return this.hp;
    }
    this.hp = this.hp - (monsteratk - this.def);

    return this.hp;
  }
}

class Monster {
  constructor(stagenumber) {
    this.hp = 10 + stagenumber * Math.floor(Math.random() * 14);
    this.atk = 5 + stagenumber * Math.floor(Math.random() * 7);
    // stagenumber에 random메서드를 달아서 배율 추가해보기(나중에)
  }

  attack(hp) {
    // 몬스터의 공격
    let playerhp;

    playerhp = hp - this.atk;

    return playerhp;
  }
}

function sleep(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {}
}
// 출처: https://splayer.tistory.com/46 [S Player:티스토리]

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
      chalk.blueBright(`| 플레이어 정보 hp : ${player.hp} atk : ${player.atk} def : ${player.def}`) +
      chalk.redBright(`| 몬스터 정보 | hp : ${monster.hp} atk : ${monster.atk}`),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

const battle = async (stage, player, monster) => {
  let logs = [];

  while (player.hp > 0 && monster.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    console.log(chalk.green(`\n1. 공격한다 2. 도망간다 (${player.canrun}%). 3. 방어한다`));
    const choice = readlineSync.question('당신의 선택은? ');

    // 플레이어의 선택에 따라 다음 행동 처리
    logs.push(chalk.green(`${choice}를 선택하셨습니다.`));

    // switch ~ case로 플레이어 몬스터 스탯 변경
    // 해당 switch는 server에 있는 switch문을 그냥 복사해서 약간만 수정
    // 안되면 말고 일단 이렇게 넣어두기
    switch (choice) {
      case '1':
        console.log(chalk.yellow('몬스터를 공격합니다.'));
        // 공격 함수를 통해 player와 monster의 hp수치에 변동
        // 이게 player의 attack메서드를 통해 몬스터의 hp 변동을 어떻게 줘야할 지 모르겠음
        // 타격 대상의 hp를 요소로 받아서 진행
        sleep(250);
        monster.hp = player.attack(monster.hp);
        logs.push(chalk.yellow(`공격에 성공해 ${player.atk}의 데미지를 주었습니다.`));

        player.hp = monster.attack(player.hp);
        logs.push(chalk.red(`몬스터의 반격으로 ${monster.atk}의 데미지를 받았습니다.`));
        break;
      case '2':
        console.log(chalk.yellow('도주를 시도합니다'));
        sleep(250);
        // 라운드가 넘어가는 상황
        // stage를 넘기는 방법도 있고
        // 몬스터의 hp를 0으로 해버릴 수 있지 않을까 - 가장 간단한 방법
        // 메서드만 넣어서 동작하게 하고싶음 - 메시지를 넣는데 log가 여기있어서
        if (player.canrun >= 100 * Math.random()) {
          console.log(chalk.yellow('도주에 성공했습니다!'));
          sleep(250);
          monster.hp = 0;
        } else {
          sleep(250);
          player.hp = monster.attack(player.hp);
          logs.push(chalk.red(`도주에 실패하여 ${monster.atk}의 데미지를 받았습니다.`));
        }

        break;
      case '3':
        console.log(chalk.yellow('몬스터의 공격을 방어합니다'));
        let imsihp = player.hp;
        player.hp = player.defence(monster.atk);
        sleep(250);
        logs.push(chalk.yellow(`방어에 성공하여 ${imsihp - player.hp}만큼의 피해를 입었습니다.`));
        sleep(250);
        break;
      default:
        logs.push(chalk.red('올바른 선택을 하세요.'));
      // 다시 입력받는 상태로 만들기
      // 이것도 뭐가 필요한지는 별도로 생각

      // 게임 종료가 되도 해당 로그를 좀 띄우고 싶은데 (hp 수치 등)
      // settime으로 되나? 안되고
      // 왜 게임이 hp 0되면 바로 끝나지
      // = startGame() 이 게임 로그인데 해당 로그가 hp가 0이 되면 나가리라서
      // 그러면 battle() 안에서 해당 정보를 완료하기? 아니면 안쪽 로그를 표기하고 끝
    }
  }
};

export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;

  while (stage <= 10) {
    const monster = new Monster(stage);
    await battle(stage, player, monster);
    // battle 이라는 함수가 끝날 때 까지 비활성

    // 클리어 조건 플레이어 hp > 0 , 몬스터 hp <= 0
    // 아니면 도망이 성공하던가
    // 게임 종료 조건 플레이어 hp <= 0
    if (monster.hp <= 0 && player.hp > 0) {
      // 클리어시 추가 스펙
      console.log(chalk.green('스테이지를 클리어 하셨습니다'));
      sleep(500);
      player.hp = player.hp + 20;
      player.atk = player.atk + 7;
      player.canrun = Math.floor(player.canrun * (0.5 + Math.random())) + 1;
      player.def = player.def + 5
      if (player.canrun > 100) {
        player.canrun = 100;
      }
    } else if (player.hp <= 0) {
      // 이거 게임종료가 여러번 나와서 탈출 넣어야함
      break;
    }
    // 스테이지 클리어 및 게임 종료 조건 << 힌트
    stage++;
  }

  if (stage <= 10) {
    console.log(chalk.red('사망하셨습니다. 클리어 실패!'));
  } else if (stage === 11) {
    console.log(chalk.green('게임 클리어를 축하드립니다!'));
  } else {
    console.log(chalk.yellow('버그?'));
  }
}
