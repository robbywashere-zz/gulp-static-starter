module.exports = function (config) {

  var root = JSON.parse(JSON.stringify(config))

  step(root)

  return root

  function step(obj,stack=[]) {

    if (typeof obj === "string") {

      let matchstr = obj.match(/!this\[(.+?)\]/)

      if (matchstr && typeof matchstr[1] !== "undefined") {
        let remainder = obj.split(/!this\[.+?\]/)[1]

        let exec = `root.${matchstr[1]}`

        console.log(exec)

        return step(eval(exec),stack.slice()) + remainder

      }

      else {
        return(obj)
      }

    }

    if (typeof obj == "object") {

      for (var key in obj) {

        let newStack = [...stack,...[key]]

        let end = step(obj[key],newStack)

        if (typeof end === "string") {

          let exec = `root.${newStack.join('.')}='${end}'`

          eval(exec);

        }

      }
    }
  }


}


