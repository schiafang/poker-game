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
      </div>
    `
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
  displayCards() {
    //找出要放入卡片的容器元素
    const rootElement = document.querySelector('#cards')
    //rootElement.innerHTML = this.getCardElement(51)
    //rootElement.innerHTML = Array.from(Array(52).keys()).map(index => this.getCardElement(index)).join("")
    rootElement.innerHTML = utility.getRandomNumberArray(52).map(index => this.getCardBack(index)).join('')
  },
  flipCard(card) {
    if (card.classList.contains('back')) {
      card.classList.remove('back')
      card.innerHTML = this.getCardFront(Number(card.dataset.index)) //HTML回傳的是字串
      return
    } else {
      card.classList.add('back')
      card.innerHTML = null
    }
  }


}
//----- 模組 model-----//
//----- 模組 controller -----//


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

view.displayCards()


//為每一個.card 產生監聽器，總共需要 52 個監聽器
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    console.log(card)
    view.flipCard(card)

  })
})