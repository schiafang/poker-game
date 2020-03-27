//----- state machine -----//
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}
const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg'  // 梅花
]

//----- 模組 view -----//
const view = {
  getCardFront(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
    <div class="card">
        <p>${number}</p>
        <img src="${symbol}">
        <p>${number}</p>
      </div> `
  },
  getCardBack(index) {
    return `<div data-index="${index}" class="card back"></div>`
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  displayCards(indexes) {
    //找出要放入卡片的容器元素
    const rootElement = document.querySelector('#cards')
    //rootElement.innerHTML = this.getCardElement(51)
    //rootElement.innerHTML = Array.from(Array(52).keys()).map(index => this.getCardElement(index)).join("")
    //rootElement.innerHTML = utility.getRandomNumberArray(52).map(index => this.getCardBack(index)).join('') 
    //帶入參數改由controller呼叫洗牌模組
    rootElement.innerHTML = indexes.map(index => this.getCardBack(index)).join('')
  },
  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardFront(Number(card.dataset.index)) //HTML回傳的是字串
        return
      }
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector(".score").innerText = `Score: ${score}`;
  },

  renderTriedTimes(times) {
    document.querySelector(".tried").innerText = `You've tried: ${times} times`;
  },
  //動畫顯示監聽:動畫只跑完一次 {once: true} 結束
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>You're Awesome!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>`
    const header = document.querySelector('#header')
    header.before(div)
  }
}

//----- 模組 model-----//
const model = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13 //回傳布林值
  },
  score: 0,
  triedTimes: 0
}

//----- 模組 controller -----//
const controller = {
  //目前遊戲狀態
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  //派發遊戲狀態改變目前狀態
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return //如果是非背面狀態時return不進入下個狀態
    }
    //操作狀態轉換
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.renderTriedTimes(++model.triedTimes) //翻牌次數
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)

        if (model.isRevealedCardsMatched()) {
          //判斷配對是否成功
          //配對成功，並加上配對成功的pairCard樣式
          //清空暫存牌卡區並回到等待第一張牌狀態
          this.currentState = GAME_STATE.CardsMatched
          view.renderScore(model.score += 10)
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗，進入配對失敗狀態
          //呼叫flipCard將牌翻回正面清空暫存區並回到等待第一張牌狀態
          //在重置卡片前呼叫CSS動畫
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1500)
        }
        break
    }
    // console.log(model.revealedCards)
    // console.log('this.currentState', this.currentState)
    // console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
    // console.log(this.currentState)
  },
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    // this.currentState = GAME_STATE.FirstCardAwaits
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
  //當resetCards放進setTimeout時，this指向setTimeout
}

//----- 模組 utility -----//
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

//由controller派發初始狀態畫面
controller.generateCards()

//----- 監聽 -----//
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})