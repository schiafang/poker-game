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
  // getCardFront()負責正面卡片內容
  // displayCards()找出容器，抽換內容
  // 產生52個數字陣列，迭代陣列放進displayCards()
  // 將52張牌綁上監聽
  // 將背面與正面分開處理，加入getCardBack()，加上dataset-*
  // displayCards()預設內容改為背面
  // 加入翻牌動作的函式flipCard()，在監聽器上加上翻牌函式
  getCardFront(index) {
    //卡牌數字是 index 除以 13後的「餘數 +1」
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
  flipCard(card) {
    if (card.classList.contains('back')) {
      card.classList.remove('back')
      card.innerHTML = this.getCardFront(Number(card.dataset.index)) //HTML回傳的是字串
      return
    }
    card.classList.add('back')
    card.innerHTML = null
  },
  pairCard(card) {
    card.classList.add('paired')
  }
}
//----- 模組 model-----//
const model = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13 //回傳布林值
  }
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
        view.flipCard(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.flipCard(card)
        model.revealedCards.push(card)

        if (model.isRevealedCardsMatched()) {
          //判斷配對是否成功
          //配對成功，並加上配對成功的pairCard樣式
          //清空暫存牌卡區並回到等待第一張牌狀態
          this.currentState = GAME_STATE.CardsMatched
          view.pairCard(model.revealedCards[0])
          view.pairCard(model.revealedCards[1])
          model.revealedCards = []
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗，進入配對失敗狀態
          //呼叫flipCard將牌翻回正面清空暫存區並回到等待第一張牌狀態
          this.currentState = GAME_STATE.CardsMatchFailed
          setTimeout(() => {
            view.flipCard(model.revealedCards[0])
            view.flipCard(model.revealedCards[1])
            model.revealedCards = []
          }, 500)
          this.currentState = GAME_STATE.FirstCardAwaits
        }
        break
    }
    console.log(model.revealedCards)
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
    //console.log(model.revealedCards[0].dataset.index)
    console.log(this.currentState)
  }
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
//view.displayCards()
controller.generateCards()

//----- 監聽 -----//
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    //view.flipCard(card)
    //監聽使用者點擊卡片後遊戲推進的狀態
    controller.dispatchCardAction(card)

  })
})


