var pt = document.querySelector("#theTable")
var mt = document.querySelector("#miniTable")
var summary = document.querySelector("#summary")
var search = document.querySelector("#search")
var c1 = document.querySelector("#startColor")
var c2 = document.querySelector("#endColor")

var elementEls = [...pt.querySelectorAll(":scope > div:not([class~='header_group']):not([class~='header_period']):not([id^='banner']):not([id^='connector']):not([id^='summary'])")];
const labelMap = {
  "cpk_hex": "CPK color",
  "category":"Series",
  "electron_configuration":"Electron config",
  "electron_configuration_semantic":"Electron config Semantic",
  "electronegativity_pauling":"Electronegativity",
  "ionization_energies":"Ionization (kJ/mol)",
  "melt":"Melting Point",
  "boil":"Boiling Point",
  "phase":"Phase (0°C)",
  "xpos":"Group"
}
const seriesColors = {
  "unknown":"#989898",
  "alkali metal":"hsl(48deg, 77%, 64%)",
  "alkaline earth metal":"hsl(60deg, 83%, 67%)",
  "lanthanide":"hsl(334deg, 76%, 86%)",
  "actinide":"#fce0ed",
  "transition metal":"hsl(10deg, 63%, 84%)",
  "metalloid":"hsl(165deg, 58%, 76%)",
  "polyatomic nonmetal":"hsl(120deg, 73%, 74%)",
  "diatomic nonmetal":"hsl(120deg, 73%, 74%)",
  "post-transition metal":"hsl(222deg, 62%, 80%)",
  "noble gas":"hsl(300deg, 74%, 82%)",
}
const superscripts = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'}
const unitsMap = {
  "atomic_mass":"amu",
  "Celsius":"°",
  "Fahrenheit":"°",
  "Kelvin": "K",
  "electron_affinity":"kJ/mol",
  "electronegativity_pauling":"kJ/mol",
  "ionization_energies":"kJ/mol",
  "radius":"pm",/*hardness*/
  "vickers":"MPa",
  "brinell":"MPa",
  "mohs":"MPa",
  "bulk":"GPa",/*modulus*/
  "shear":"GPa",
  "young":"GPa",
  "stp":"kg/m³",/*density*/
  "liquid":"kg/m³",
  "thermal":"W/mK",/*conductivity*/
  "electric":"MS/m",
  "specific":"J/kgK",/*heat*/
  "fusion":"kJ/mol",
  "vaporization":"kJ/mol",
  "molar":"J/K.mol",
  "universe":"%",/*abundance*/
  "solar":"%",
  "meteor":"%",
  "ocean":"%",
  "crust":"%",
  "human":"%",
  "calculated":"pm",/*radius*/
  "empirical":"pm",
  "covalent":"pm",
  "vanderwaals":"pm"
}
const colorMap = {
  "boil":{ "start": "#0000ff", "end": "#ff0000"},
  "melt":{ "start": "#0000ff", "end": "#ff0000"},
  "abundance":{ "start": "#8989ae", "end": "#ffae00"},
  "density":{ "start": "#ff00ff", "end": "#ffff00"},
  "atomic_mass":{ "start": "#e38ce3", "end": "#ffff00"},
  "discovered":{ "start": "#0f00ff", "end": "#f5efef"},
  "electron_affinity":{ "start": "#00fffff", "end": "#f3d720"},
  "electronegativity_pauling":{ "start": "#eccaec", "end": "#ff0240"},
  "hardness":{ "start": "#d9c4e4", "end": "#8b0ff5"},
  "heat":{ "start": "#0000ff", "end": "#ff0000"},
  "density":{ "start": "#8ad6ee", "end": "#ffff00"},
  "radius":{"start":"#e9f631", "end": "#000fff"},
  "conductivity":{"start":"#0ffff0", "end":"#e11466"},
  "modulus":{"start":"#cbd194", "end":"#0000ff"}
}

/*fields either not displayed at all in the details section, or are instead displayed in the "element card"*/
var doNotDisplay = ["ypos", "source"];
/*detail fields that are color-sortable*/
var clickableDetail = ["summary", "abundance", "atomic_mass", "boil", "conductivity", "density", "discovered", "electron_affinity", "electronegativity_pauling", "heat", "melt", "hardness", "modulus", "radius", "category", "cpk_hex" ]

/*ok, first, shape the data a bit by adding some calculated temps*/
window.pTable.forEach(el=>{
  el.boil && (el.boil = {
    "Celsius": (el.boil-273.15).toFixed(2),
    "Fahrenheit":((el.boil-273.15) * (9/5) + 32).toFixed(2),
    "Kelvin":el.boil
  })
  el.melt && (el.melt = {
    "Celsius": (el.melt-273.15).toFixed(2),
    "Fahrenheit":((el.melt-273.15) * (9/5) + 32).toFixed(2),
    "Kelvin":el.melt
  })
})

let handleNavClick = (el) => {
  let realEl = pt.querySelector(`#${el.id}`)
  //const element = realEl
  //const elementRect = element.getBoundingClientRect();
  //const absoluteElementTop = elementRect.top + window.pageYOffset;
  //const middle = absoluteElementTop - (window.innerHeight / 2);
  realEl.scrollIntoView({behavior:'smooth', block: "center"})
}

/*MAIN LOOP*/

var last
function handleMouseEnter(ev) {
  if(last!=undefined) {
    last.style.outline = "none"
  }
     
  last = mt.querySelector(`#${ev.target.id}`);
  last.style.outline = "2px solid chartreuse"
}
elementEls.forEach(async (el,i)=>{
   
    el.addEventListener("mouseenter", handleMouseEnter)
  
    /*CARD*/
    let element = window.pTable.find(t=>t.symbol==el.id);
    
    /*NAV table*/
    let m = miniTable.querySelector(`#${element.symbol}`)
    m.innerText = element.symbol;
    m.addEventListener("click", () => {
      handleNavClick(m)
    })
    
    let color = "#"+element.cpk_hex
    var neon = `text-shadow: 0 0 5px white, 0 0 10px ${color}, 0 0 15px ${color}, 0 0 20px ${color}`
    let card = document.createElement("div")
    card.classList.add("card")
    card.innerHTML = `<span>${element.number}</span>`
    let isRadioActive = /radioactive/.test(element.summary);
    //let radioActiveStr = isRadioActive ? "<span class='radioactive'>☢️</span>" : ""

  /******** ELEMENT IMAGE ********/
  let img = new Image()
  let imgFrag = ""
  if(elementImages[element.symbol]){
    let src = 'data:image/jpg;base64, '+ elementImages[element.symbol];
    await loadImage(img,src);
    img.width = img.naturalWidth/2;
    img.height = img.naturalHeight/2;
    imgFrag = "<span>"+img.outerHTML+"</span>"; 
  }
    
  
    card.innerHTML += `<span class='${isRadioActive?"radioactive":""}' style="${neon}">${element.symbol}</span>${imgFrag}`
    let catLabel = element.category.match(/unknown|.*/i)[0]
    card.innerHTML += `<span class='category' style='background-color:${seriesColors[catLabel]}'><span style='color:${seriesColors[catLabel]}'>${catLabel}</span></span>`

    /*replace first occurence of name in the summary with the wiki link*/
    let findName = new RegExp(element.name, "i")
    let sum = element.summary.replace(findName, `<a target="_blank" href='${element.source}'>$&</a>`)
    card.innerHTML += `<span>${sum}</span>` 
    el.appendChild(card)
    
    /*DETAILS*/    
    /*first, sort the fields not by their real name, but by their mapped label name if available*/
    let sortedFields = Object.keys(element).sort((a,b)=>{
      return (labelMap[a]||a).toLowerCase()>(labelMap[b]||b).toLowerCase() ? 1 : -1 
    })
    sortedFields = ["atomic_mass", "melt", "boil", "abundance", "appearance", "conductivity", "cpk_hex", "density", "discovered", "discovered_by", "electron_configuration", "electron_affinity", "electron_configuration_semantic", "electronegativity_pauling", "hardness", "heat", "ionization_energies", "modulus", "oxidation", "phase", "radius", "shells", "source", "xpos", "period"]

    sortedFields.forEach(key=> {   

      if(element[key] === undefined || doNotDisplay.some(dont=>dont==key)) return;

      let span = document.createElement("div")
      
      span.classList.add(key)
      span.classList.add("keyValuePair")

      let text = labelMap[key] || key
      text = capitalize(text)
      span.innerHTML= `<span class='key'>${text}:</span> <span class='value'>${printProp(key, element[key])}</span>`   
         
      el.appendChild(span)
      
      //change event for multi-data dropdowns (which is: color sort if already sorting on this category)
      span.querySelector("select")?.addEventListener("change", function(ev){
        let outerDiv = ev.target.parentNode.parentNode
        if(outerDiv.classList.contains("selected")){
          setColorByKey(outerDiv.id+"."+ev.target.value.match(/^\w+/)[0])
        }
      })
    })

})//end foreach elementEl

/*dark mode/light mode switch*/
document.querySelector("#lightMode").addEventListener("click", function(ev){
  if(ev.target.classList.contains("disabled")) {
     ev.target.classList.remove("disabled")
  } else {
     ev.target.classList.add("disabled")
  }
  let body = document.querySelector("body")
  if(body.classList.contains('light')) {
    body.classList.remove("light")
  } else {
    body.classList.add("light")
  }
})

mt.addEventListener('dragstart', handleDragStart);
document.body.ondragover = handleDragOver;
document.body.ondrop = handleDrop;

var MOUSEDOWN = false;
window.addEventListener("mousedown", (ev) => {
  if(ev.target.id == "miniTable") return false;
  MOUSEDOWN = true;
  document.body.style.cursor = "grabbing"
})
window.addEventListener("mouseup", (ev) => {
  MOUSEDOWN = false;
  document.body.style.cursor = "grab"
  
})
window.addEventListener("mousemove", (ev) => {
  if(MOUSEDOWN){
    window.scrollBy(-ev.movementX, -ev.movementY);
  }
})
window.addEventListener("mouseleave", (ev) => {
  MOUSEDOWN = false;
})

window.scrollTo(0,0)

console.log(`${pt.scrollWidth} x ${pt.scrollHeight}`)

function getElementKey(detailDiv) {
  /*get either simple key which is the div's id (eg "electron_affinity"), or if it contains <select>, get compound key eg "hardness.brickells" */
  let valueEl = detailDiv.children[1].children[0];
  if(valueEl.nodeName.toLowerCase()=="select"){
    let subKey = valueEl.value.match(/^[^:]+/)[0]
    return (detailDiv.id+"."+subKey)
  } else {
    return (detailDiv.id)
  }
}

function printProp(key,obj){
/*recursively call on obj types and build <selects> (a must to save space), otherwise, print the value*/
  if(typeof(obj)=="object"){
    let rez = ""
    let keys = Object.keys(obj)
    keys.forEach((key,i)=>{
      //the test here avoids the nested span which makes printing arrays too long, ok for other values.
      if(/^\d+$/.test(key)){
        rez += `<span class='nested'><span class='key'>${key}:</span><span class='value'>${printProp(key,obj[key])}</span></span>`
      } else {
        rez += `<span class='key'>${key}:</span><span class="value">${printProp(key,obj[key])}</span>`
      }
      
    })
    return rez.replace(/,$/, "")
  } else { //simple value
    if(/electron_configuration/.test(key)) obj = superScript(obj)
    let cpk = key=="cpk_hex" 
    if(cpk) {
      obj = "#"+obj
      let color = (obj=="#a67573"||obj=="#2194d6")? "black" : obj
      return `<span class='value cpk' style='background-color:${obj};color:${color}'><span>${isNumber(obj)?parseFloat(obj.toFixed(6)):obj}</span><span class='units'>${unitsMap[key]||""}</span></span>`
    } else {
      return `<span class='value'>${isNumber(obj)?parseFloat(obj.toFixed(6)):obj}<span class='units'>${unitsMap[key]||""}</span></span>`
    }

  }

}

/*UTILITY*/
function superScript(electron_config) {
  //superscript trailing numbers in electron config string.
  let cf = electron_config 
  return cf.replace(/(?<=[a-z])(\d+)/g, function(m,g1) {
    let rep = ""
    g1.split("").forEach((ch)=>{
      rep+=superscripts[Object.keys(superscripts).indexOf(ch)]
    })
    return rep
  })
}
function capitalize(str){
  //also makes _underscores_ spaces
  return str.replace(/_/g, " ").replace(/^[a-z]/, (m)=>{
    return m.toUpperCase()
  })
}
function hexToRGB(hex){   
  return hex.match(/[A-Za-z0-9]{2}/g).map(function(component) { return parseInt(component, 16) })
} 
function valueAt(key, obj) {
  return key.split('.').reduce((p,c)=>p?.[c]||null, obj)
}
function isNumber(n){
  return Number(n)===n;
}

async function delay(ms){
  return new Promise((resolve,reject)=>setTimeout(ms, resolve));
}

function loadImage(img,src) {
  return new Promise((res,rej)=>{
    img.onload = res;
    img.src = src;
  })
}

function handleDragStart(ev) {

    ev.target.setAttribute("myOffsetX", ev.offsetX)
    ev.target.setAttribute("myOffsetY", ev.offsetY)
    ev.dataTransfer.setData("text/plain", ev.target.id);

}
function handleDragOver(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = "move";
}
function handleDrop(ev) {
  MOUSEDOWN = false;
  ev.preventDefault();
  const myId = ev.dataTransfer.getData("text/plain");
  var el = document.querySelector(`#${myId}`)
  ev.dataTransfer.dropEffect = "move";
 
  let w = parseInt(window.getComputedStyle(miniTable,null).width)
  let byMouse = ev.clientX-parseInt(el.getAttribute("myOffsetX"))
  el.style.left = byMouse+"px"
  let right;
  if(window.innerWidth < (byMouse+w)) {
    right = 0 - ((byMouse+w)-window.innerWidth) 
  } else {
    right = null
  }
  el.style.right = right?right+"px":"unset"
  el.style.top = (ev.clientY-parseInt(el.getAttribute("myOffsetY")))+"px"
}


