const fs = require("fs")
const child_process = require("child_process")

let regs = ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"]

function compose(test_suites) {
    let outputSource = "main:\n"
    let expectedDRamVal = []

    let tests = []

    let reg = []

    let inst = []

    for (let i = 0; i < test_suites.length; i++) {
        let test = test_suites[i]
        outputSource += test.inst + "\n"
        expectedDRamVal = expectedDRamVal.concat(test.exp)
        tests = tests.concat(test.tests)
        reg = reg.concat(test.reg)
        inst = inst.concat(test.instCount)
    }
    return {
        source: outputSource,
        expected: expectedDRamVal,
        tests: tests,
        reg: reg,
        inst: inst
    }
}

function compile(sourceCode) {
    return new Promise((res, rej) => {
        let fileName = parseInt(Math.random() * 100000) + ".s"
        let binary = ""
        fs.promises.writeFile(fileName, sourceCode).then(() => {
            return new Promise((res1, rej1) => {
                let std = ""
                let child = child_process.spawn(`bash`, [`compile.sh`, fileName, `${fileName}.txt`], { cwd: __dirname })
                child.stdout.on('data', (data) => {
                    std += data.toString()
                })
                child.stderr.on('data', (data) => {
                    std += data.toString()
                })
                child.on("exit", (d) => {
                    if (d === 0) res1()
                    else rej1(new Error("Compile Error: " + d + "\n\nOutput:\n" + std))
                })
            })
        }).then(() => {
            return fs.promises.readFile(fileName + ".txt")
        }).then((data) => {
            binary = data.toString()
            return fs.promises.unlink(fileName)
        }).then(() => {
            return fs.promises.unlink(fileName + ".txt")
        }).then(() => {
            res(binary)
        }).catch((e) => {
            rej(e)
        })
    })
}
function rfADDI(num) {
    let instructions = []
    let exp_res = []
    let tests = []
    let reg = []
    let inst = []

    for (let i = 0; i < num; i++) {
        let t1 = regs[parseInt(Math.random() * regs.length)]
        let current = parseInt(Math.random() * 100) - 50
        instructions.push(`addi $${t1}, $zero, ${current}`)
        tests.push(`addi $${t1}, $zero, ${current}`)
        exp_res.push(current)
        reg.push(t1)
        inst.push(1)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res,
        reg: reg,
        instCount: inst
    }
}

function rfADD(num) {
    let instructions = []
    let exp_res = []
    let tests = []
    let reg = []
    let inst = []

    for (let i = 0; i < num; i++) {
        let t1 = regs[parseInt(Math.random() * regs.length)]
        let t2 = regs[parseInt(Math.random() * regs.length)]
        let inp1 = parseInt(Math.random() * 100) - 50
        let inp2 = parseInt(Math.random() * 100) - 50
        instructions.push(`addi $${t1}, $zero, ${inp1}`)
        instructions.push(`addi $${t2}, $zero, ${inp2}`)
        instructions.push(`add $${t1}, $${t2}, $${t1}`)
        tests.push(`add $${t1}, $${t2}(${inp2}), $${t1}(${inp1})`)
        if (t1 === t2) {
            exp_res.push(inp2 * 2)
        }
        else {
            exp_res.push(inp1 + inp2)
        }
        reg.push(t1)
        inst.push(3)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res,
        reg: reg,
        instCount: inst
    }
}

function rfAND(num) {
    let instructions = []
    let exp_res = []
    let tests = []
    let reg = []
    let inst = []

    for (let i = 0; i < num; i++) {
        let t1 = regs[parseInt(Math.random() * regs.length)]
        let t2 = regs[parseInt(Math.random() * regs.length)]
        let inp1 = parseInt(Math.random() * 100) - 50
        let inp2 = parseInt(Math.random() * 100) - 50
        instructions.push(`addi $${t1}, $zero, ${inp1}`)
        instructions.push(`addi $${t2}, $zero, ${inp2}`)
        instructions.push(`and $${t1}, $${t2}, $${t1}`)
        tests.push(`and $${t1}, $${t2}(${inp2}), $${t1}(${inp1})`)
        if (t1 === t2)
            exp_res.push(inp2)
        else
            exp_res.push(inp1 & inp2)
        reg.push(t1)
        inst.push(3)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res,
        reg: reg,
        instCount: inst
    }
}

function rfLUI(num) {
    let instructions = []
    let exp_res = []
    let tests = []
    let reg = []
    let inst = []

    for (let i = 0; i < num; i++) {
        let t1 = regs[parseInt(Math.random() * regs.length)]
        let inp1 = parseInt(Math.random() * 2 ^ 16)
        let inp2 = parseInt(Math.random() * 100)
        instructions.push(`lui $${t1}, ${inp2}`)
        instructions.push(`addi $${t1}, $${t1}, ${inp1}`)
        tests.push(`lui $${t1}, ${inp2}; addi $${t1}, ${inp1}`)
        exp_res.push(inp1 + (inp2 << 16))
        reg.push(t1)
        inst.push(2)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res,
        reg: reg,
        instCount: inst
    }
}

function rfORI(num) {
    let instructions = []
    let exp_res = []
    let tests = []
    let reg = []
    let inst = []

    for (let i = 0; i < num; i++) {
        let t1 = regs[parseInt(Math.random() * regs.length)]
        let inp1 = parseInt(Math.random() * 100) - 50
        let inp2 = parseInt(Math.random() * 100)
        instructions.push(`addi $${t1}, $zero, ${inp1}`)
        instructions.push(`ori $${t1}, $${t1}, ${inp2}`)
        tests.push(`addi $${t1}, $zero, ${inp1}; ori $${t1}, $${t1}, ${inp2}`)
        exp_res.push(inp1 | inp2)
        reg.push(t1)
        inst.push(2)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res,
        reg: reg,
        instCount: inst
    }
}

function rfSLT(num) {
    let instructions = []
    let exp_res = []
    let tests = []
    let reg = []
    let inst = []

    for (let i = 0; i < num; i++) {
        let t1 = regs[parseInt(Math.random() * regs.length)]
        let t2 = regs[parseInt(Math.random() * regs.length)]
        let inp1 = parseInt(Math.random() * 100) - 50
        let inp2 = parseInt(Math.random() * 100) - 50
        instructions.push(`addi $${t1}, $zero, ${inp1}`)
        instructions.push(`addi $${t2}, $zero, ${inp2}`)
        instructions.push(`slt $${t1}, $${t1}, $${t2}`)
        tests.push(`addi $${t1}, $zero, ${inp1}; addi $${t2}, $zero, ${inp2}; slt $${t1}, $${t1}, $${t2}`)
        if (t1 === t2)
            exp_res.push(0)
        else
            exp_res.push(inp1 < inp2 ? 1 : 0)
        reg.push(t1)
        inst.push(3)
    }
    return {
        tests: tests,
        inst: instructions.join("\n"),
        exp: exp_res,
        reg: reg,
        instCount: inst
    }
}

const functionMap = {
    "addi": rfADDI,
    "add": rfADD,
    "and": rfAND,
    "lui": rfLUI,
    "ori": rfORI,
    "slt": rfSLT
}

module.exports = {
    compose,
    compile,
    functionMap
}