import {HTMLPlus} from "./html-plus.js"

const defaultStyle = `
.letter-input {
  display: flex;
  --cursor-color: #a18b8033;
}
.letter{
  text-align: center;
}
.letter > div, .whitespace > div {
  width: 0.7em;
  margin: 0.1em;
  padding-bottom: 0.2em;
  height: 1em;
}
.letter > div {
  border-bottom: 2px solid black;
}
.letter[cursor] {
  background: var(--cursor-color);
}`

let style = new HTMLPlus("style");
style.innerHTML = defaultStyle;
document.head.appendChild(style);

const specialChars = {
  A: "ÁÀÂǍĂÃ",
  a: "áàâǎăã",
  C: "ĆĈČĊC̄",
  c: "ćĉčċc̄",
  D: "Ď",
  d: "ď",
  e: "éèêěĕẽ",
  E: "ÉÈÊĚĔẼ",
  G: "ǦǴĞĜ",
  g: "ǧǵğĝ",
  H: "ĤȞ",
  h: "ĥȟ",
  I: "ÍÌĬÎǏ",
  i: "íìĭîǐ",
  J: "Ĵ",
  j: "ĵ",
  K: "ḰǨ",
  k: "ḱǩ",
  L: "Ĺ",
  l: "ĺ",
  M: "ḾṀ",
  m: "ḿṁ",
  N: "ŃǸŇÑṄ",
  n: "ńǹňñṅ",
  O: "ÓÒŎÔÕ",
  o: "óòŏôõ",
  P: "ṔṖ",
  p: "ṕṗ",
  R: "ŔŘṘ",
  r: "ŕřṙ",
  S: "ŚŜŠ",
  s: "śŝ",
  T: "ŤṪ",
  t: "ťṫ",
  U: "ÚÙŬÛǓŮÜ",
  u: "úùŭûǔůü",
  V: "ṼṾ",
  v: "ṽṿ",
  W: "ẂẀŴẄẆẘⱲ",
  w: "ẃẁŵẅẇẘⱳ",
  X: "ẌẊ",
  x: "ẍẋ",
  Y: "ÝỲŶŸỸẎ",
  y: "ýỳŷẙÿỹẏ",
  Z: "ŹẐŽ",
  z: "źẑž",
}


function isWhitespace(text){
  return !!text.match(/\s/)
}

class Letter extends HTMLPlus {
  constructor(index, char){
    super("div");
    this._value = " ";
    this.index = index;
    this.letter = this.createChild("div");
    if (isWhitespace(char)) {
      this._whitespace = true;
      this.class = "whitespace"
    } else {
      this.class = "letter"
    }
  }

  get whitespace(){
    return this._whitespace;
  }

  cursorOn(){
    this.toggleAttribute("cursor", true);
    if (this.intv == null) {
      this.intv = setInterval(() => {
        this.toggleAttribute("cursor");
      }, 420)
    }
  }

  cursorOff(){
    clearInterval(this.intv);
    this.toggleAttribute("cursor", false);
    this.intv = null;
  }

  set cursor(value) {
    if (value) this.cursorOn();
    else this.cursorOff();
  }

  set value(value) {
    if (!this.whitespace) {
      this._value = value;
      this.letter.innerHTML = value;
    }
  }

  get value(){
    return this._value;
  }
}

class LetterInput extends HTMLPlus {
  constructor() {
    super("div");
    this.class = "letter-input"
    let wk = (e) => {
      if (this.isConnected) {
        this.window_key(e);
      } else {
        window.removeEventListener("keydown", wk)
      }
    }

    window.addEventListener("keydown", wk);

    let wu = (e) => {
      if (this.isConnected) {
        this.window_keyup(e);
      } else {
        window.removeEventListener("keyup", wu)
      }
    }
    window.addEventListener("keyup", wu);

    let ck = (e) => {
      if (this.isConnected) {
        this.window_click(e);
      } else {
        window.removeEventListener("keyup", ck)
      }
    }
    window.addEventListener("click", ck);
  }

  selectFirstEmpty(){
    for (let child of this.children) {
      if (child.value == " " && !child.whitespace) {
        this.selected = child;
        break;
      }
    }
  }

  window_key(e) {
    this.move = null;
    let selected = this.selected;
    if (selected) {
      if (e.key.length == 1) {
        while (e.key != " " && selected.whitespace) {
          selected = selected.nextSibling
        }
        this.selected = selected;

        if (this.letter_held) {
          if (e.key.match(/[0-9]/)) {
            let i = parseInt(e.key);

            let spec = specialChars[this.letter_held][i];
            if (spec) {
              this.selected.value = spec;
            }
          }else {
            this.selected.value = this.letter_held;
            this.move_cursor();
            this.selected.value = e.key;
            this.letter_held = e.key;
          }
        } else {
          if (e.key.match(/[a-zA-z]/)) {
            this.letter_held = e.key;
          }

          this.selected.value = e.key;
        }
      }else if (e.key === "Backspace") {
        this.selected.value = "";
        if (this.backspace_held) {
          this.move_cursor(true);
        } else {
          this.backspace_held = true;
        }
      }
    }
  }

  window_keyup(e){
    if (e.key == "Backspace") this.backspace_held = false;
    if (e.key == this.letter_held) this.letter_held = false;
    if (this.selected && !this.letter_held) {
      if (e.key.length == 1) {
        this.move_cursor(false);
      } else if (e.key === "Backspace") {
        this.move_cursor(true);
      } else if (e.key === "LeftArrow") {
        this.move_cursor(true);
      } else if (e.key === "RightArrow") {
        this.move_cursor(false);
      } else if (e.key === "Enter") {
        const event = new Event("submit");
        event.value = this.value;
        this.dispatchEvent(event);
      }
    }
  }

  move_cursor(left = false){
    let direction = left ? "previousSibling" : "nextSibling"
    let selected = this.selected;
    let next = selected;
    if (next[direction]) {
      next = next[direction];
    }
    if (next != selected) {
      this.selected = next;
    }
  }

  window_click(e) {
    let target = e.target;
    while (target && target != this) {
      target = target.parentNode;
    }
    if (!target) {
      if (this.selected) {
        this.selected.cursor = false;
        this.selected = null;
      }
    }
  }

  set selected(letter){
    if (this.selected) {
      this.selected.cursor = false;
    }
    this._selected = letter;
    if (this.selected) {
      this.selected.cursor = true;
    }
  }
  get selected(){
    return this._selected;
  }

  set word(word){
    let n = word.length;
    this.selected = null;
    for (let i = 0; i < n; i++) {
      let letter = new Letter(i, word[i]);
      if (!letter.whitespace) {
        letter.onclick = () => {
          if (letter != this.selected) {
            if (this.selected) {
              this.selected.cursor = false;
            }
            this.selected = letter;
            this.selected.cursor = true;
          }
        }
      }
      this.appendChild(letter);
    }
    this.length = n;
  }

  set value(value) {
    for (let i = 0; i < this.children.length && i < value.length; i++) {
      let letter = this.children[i];
      letter.value = value[i];
    }
  }

  get value(){
    let value = "";
    for (let letter of this.children) {
      value += letter.value;
    }
    return value;
  }
}

export {LetterInput}
