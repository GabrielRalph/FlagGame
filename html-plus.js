function isSetGet(prop) {
  return prop.get instanceof Function || prop.set instanceof Function;
}

class HTMLPlus{
  constructor(args){
    let el = HTMLPlus.parseElement(args);
    if (el == null) {
      el = HTMLPlus.make(args)
    }

    let prototype = Object.getPrototypeOf(this);
    HTMLPlus.extend(el, prototype);

    return el;
  }

  set styles(styles){
    if (typeof styles !== 'object'){
      throw `Error setting styles:\nstyles must be set using an object, not ${typeof styles}`
      return
    }
    this._style_set = typeof this._style_set != 'object' ? {} : this._style_set;
    for (var style in styles){
      var value = `${styles[style]}`
      if (value != null){
        let set = true;
        try{
          this.style.setProperty(style, value);
        }catch(e){
          set = false;
          throw e
        }
        if (set){
          this._style_set[style] = value;
        }
      }
    }
  }

  get styles(){
    return this._style_set;
  }

  set class(val){
    this.props = {class: val}
  }

  get class(){
    return this.getAttribute('class');
  }

  set props (props){
    if (typeof props !== 'object'){
      throw `Error setting styles:\nstyles must be set using an object, not ${typeof props}`
      return
    }
    this._prop_set = typeof this._prop_set != 'object' ? {} : this._prop_set;
    for (var prop in props){
      var value = props[prop]
      if (prop == 'style' || prop == 'styles'){
        this.styles = value
      }else if (prop == "innerHTML" || prop == "content") {
        this.innerHTML = value;
      }else if (value != null){
        let set = true;
        try{
          this.setAttribute(prop,value);
        }catch(e){
          set = false;
          throw e
        }
        if (set){
          this._prop_set[prop] = value;
        }
      }
    }
  }

  get props(){
    return this._prop_set;
  }

  createChild(){
    return this.makeChild.apply(this, arguments)
  }

  makeChild(){
    let Name = arguments[0];
    let child;

    if (Name instanceof Function && Name.prototype instanceof HTMLPlus){
      if (arguments.length > 1){
        child = new Name(arguments[1]);
      }else{
        child = new Name();
      }
    }else{
      child = new HTMLPlus(Name);
      try{
        if (arguments[1]){
          child.props = arguments[1];
        }
      }catch(e){
        console.error(e);
      }
    }

    this.appendChild(child);
    return child;
  }

  static addPrototype(proto, obj) {
    if (obj == null || proto == null) return;

    let protoPropNames = Object.getOwnPropertyNames(proto);

    for (let propName of protoPropNames) {
      var prop = Object.getOwnPropertyDescriptor(proto, propName);
      if (propName != 'constructor'){
        if (propName in obj && isSetGet(propName)) {
          throw new Error(`cannot overwrite setter getter ${propName}`);
        }else{
          Object.defineProperty(obj, propName, prop);
        }
      }else{
        obj['__+'] = proto.constructor;
      }
    }
  }

  static make(name){
    return document.createElement(name);
  }

  static parseElement(elem = null) {
    let parsed = elem;

    if (typeof elem === 'string'){
      parsed = HTMLPlus.make(elem);
      if (parsed == null) {
        parsed = document.getElementById(elem);
      }
    }

    return parsed;
  }

  static extend(elem, proto){
    if (elem != null && typeof elem == "object") {
      if (!('__+' in elem)) elem['__+'] = Object.prototype;
      if (
        proto != null && typeof proto == "object" && elem["__+"] != proto
      ){
        HTMLPlus.extend(elem, Object.getPrototypeOf(proto));
        this.addPrototype(proto, elem);
      }
    }
  }

  static is(el, cdef) {
    console.log(el["__+"] == cdef);
  }

  static defineHTMLElement(classDef){
    let className = classDef.name.replace(/(\w)([A-Z][^A-Z])/g, "$1-$2").toLowerCase();
    let props = Object.getOwnPropertyDescriptors(classDef.prototype);

    let setters = [];
    for (let propName in props) {
      let prop = props[propName]
      if ("set" in prop && prop.set instanceof Function) {
        setters.push(propName);
      }
    }
    let htmlClass = class extends HTMLElement{
      constructor(){
        super();
        if (!HTMLPlus.is(this, classDef)) {
          new classDef(this);
        }
      }

      applyAttributes(){
        for (let setter of setters) {
          let value = this.getAttribute(setter);
          if (value != null) {
            this[setter] = value;
          }
        }
      }

      connectedCallback(){
        if (this.isConnected) {
          if (this.onconnect instanceof Function) {
            this.onconnect();
          }
        }
      }

      disconnectedCallback(){
        if (this.ondisconnect instanceof Function) {
          this.ondisconnect();
        }
      }

      adoptedCallback(){
        if (this.onadopt instanceof Function) {
          this.onadopt();
        }
      }

      attributeChangedCallback(name, oldv, newv){
        this[name] = newv;
      }

      static get observedAttributes() { return setters; }
    }
    console.log(className+ " custom element defined");
    customElements.define(className, htmlClass);
  }
}

export {HTMLPlus}
