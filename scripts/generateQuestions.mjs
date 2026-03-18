import fs from 'node:fs'
import path from 'node:path'

const OUT_PATH = path.resolve('src/data/questions.json')

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function gcd(a, b) {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    const t = x % y
    x = y
    y = t
  }
  return x
}

function reduceFraction(n, d) {
  if (d === 0) throw new Error('division by zero')
  const g = gcd(n, d)
  const nn = n / g
  const dd = d / g
  return { n: nn, d: dd }
}

function formatFraction(n, d) {
  const { n: nn, d: dd } = reduceFraction(n, d)
  return `${nn}/${dd}`
}

function formatMonomial(coef, power, variable = 'x') {
  if (power === 0) return `${coef}`
  const abs = Math.abs(coef)
  const sign = coef < 0 ? '-' : ''
  const baseVar = power === 1 ? variable : `${variable}^${power}`
  if (abs === 1) return `${sign}${baseVar}`
  return `${sign}${abs}${baseVar}`
}

function ensureUniqueOptions(correct, candidates) {
  const set = new Set([String(correct)])
  for (const c of candidates) {
    set.add(String(c))
    if (set.size >= 4) break
  }
  const options = [...set]
  // If we still don't have enough options, pad with generic wrong values (avoid NaN).
  const correctStr = String(correct)
  const fracMatch = correctStr.match(/^(-?\d+)\/(\d+)$/)
  let k = 0
  while (options.length < 4 && k < 200) {
    if (fracMatch) {
      const n = Number(fracMatch[1])
      const d = Number(fracMatch[2])
      const extra = `${n + 1}/${d + 1 + k}`
      options.push(extra)
    } else {
      const num = Number(correctStr)
      const extra = Number.isNaN(num) ? `${correctStr}-opt-${k}` : `${num + 10 + k}`
      options.push(extra)
    }
    k++
  }
  return shuffle(options.slice(0, 4))
}

function mcq(id, question, options, answer, difficulty, explanation) {
  return { id, type: 'mcq', question, options, answer: String(answer), difficulty, explanation }
}

function tf(id, question, answer, difficulty, explanation) {
  return { id, type: 'tf', question, answer: Boolean(answer), difficulty, explanation }
}

function makeId(subjectCode, topicCode, index) {
  return `${subjectCode}-${topicCode}-${index}`
}

function buildMath() {
  const subject = { name: 'Mathematics', topics: [] }
  const topics = [
    { name: 'Algebra', code: 'alg' },
    { name: 'Calculus', code: 'calc' },
    { name: 'Trigonometry', code: 'trig' },
    { name: 'Probability', code: 'prob' },
    { name: 'Statistics', code: 'stat' },
  ]

  const subjectCode = 'math'

  for (const t of topics) {
    const questions = []
    for (let i = 1; i <= 30; i++) {
      const idx = i
      const difficulty = idx <= 10 ? 'easy' : idx <= 20 ? 'medium' : 'hard'
      const type = idx % 3 === 0 ? 'tf' : 'mcq'

      if (t.code === 'alg') {
        if (type === 'mcq') {
          const x = (idx % 11) - 5 // -5..5
          const a = ((idx * 2) % 9) + 1 // 1..10
          const b = ((idx * 3) % 21) - 10 // -10..10
          const c = a * x + b
          const q = `Solve for x: ${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c}`
          const correct = String(x)
          const wrong = [
            x + 1,
            x - 1,
            x + 2,
          ]
          const options = ensureUniqueOptions(correct, wrong)
          const explanation = `From ${a}x + ${b} = ${c}, subtract ${b}: ${a}x = ${c - b}. Divide by ${a}: x = ${(c - b) / a}.`
          questions.push(mcq(makeId(subjectCode, t.code, idx), q, options, correct, difficulty, explanation))
        } else {
          const cases = [
            ['In the equation ax + b = c, the solution is x = (c - b)/a.', true, 'easy', 'Rearrange: ax = c - b, then divide by a.'],
            ['If a = 0 and b = c, then the equation has infinitely many solutions.', true, 'medium', 'Then 0x + b = b is true for every x.'],
            ['If a = 0 and b != c, then the equation has exactly one solution.', false, 'easy', 'It becomes b = c, which is either always true or always false. If b != c, there is no solution.'],
            ['For any real numbers, (x + y)^2 = x^2 + y^2.', false, 'medium', 'The correct identity is (x + y)^2 = x^2 + 2xy + y^2.'],
            ['The factorization x^2 - 9 = (x - 3)(x + 3) is correct.', true, 'easy', 'Expand (x - 3)(x + 3) = x^2 - 9.'],
            ['If x = 2 is a root of 2x^2 - 8, then x = -2 is also a root.', true, 'medium', 'Because the polynomial has only even powers.'],
            ['The expression (x^3)/(x) equals x^2 for x != 0.', true, 'easy', 'Cancel x: x^(3-1) = x^2.'],
            ['If x + 3 = 7, then x = 5.', false, 'easy', 'x = 7 - 3 = 4.'],
            ['In general, (x - y) equals (x + (-y)).', true, 'easy', 'By definition of subtraction as adding the negative.'],
            ['The equation x^2 = 0 has two distinct real solutions.', false, 'easy', 'It has one solution x = 0 (double root).'],
          ]
          const pick = cases[(idx - 1) % cases.length]
          const [q, ans, diff2, exp] = pick
          questions.push(tf(makeId(subjectCode, t.code, idx), q, ans, diff2, exp))
        }
      }

      if (t.code === 'calc') {
        if (type === 'mcq') {
          const n = 2 + ((idx * 2) % 5) // 2..6
          const coef = n
          const power = n - 1
          const correct = coef === 1 ? (power === 1 ? 'x' : `x^${power}`) : `${coef}${power === 1 ? 'x' : `x^${power}`}`
          const correctStr = formatMonomial(coef, power)
          const q = `Find the derivative of f(x) = x^${n}.`
          const wrong1 = formatMonomial(coef, power + 1)
          const wrong2 = formatMonomial(coef - 1, power)
          const wrong3 = formatMonomial(coef, power - 1 >= 0 ? power - 1 : 0)
          const options = ensureUniqueOptions(correctStr, [wrong1, wrong2, wrong3])
          const explanation = `Using the power rule: d/dx[x^n] = n*x^(n-1). Here n = ${n}, so f'(x) = ${n}*x^${n - 1}.`
          questions.push(mcq(makeId(subjectCode, t.code, idx), q, options, correctStr, difficulty, explanation))
        } else {
          const cases = [
            ['The derivative of x is 1.', true, 'easy', 'd/dx[x] = 1 by basic rule.'],
            ['The derivative of x^3 is x^2.', false, 'easy', 'It is 3x^2.'],
            ['Integrating x^2 gives (x^3)/3 + C.', true, 'medium', 'Reverse the power rule: ∫x^n dx = x^(n+1)/(n+1) + C.'],
            ['d/dx[5] = 0.', true, 'easy', 'A constant has zero slope.'],
            ['∫ 1/x dx equals ln|x| + C.', true, 'medium', 'Standard integral of 1/x.'],
            ['The definite integral can be negative even if the area looks positive.', false, 'hard', 'Definite integral uses signed area; it can be negative if function is below x-axis, so this statement is incorrect in general.'],
          ]
          const pick = cases[(idx - 1) % cases.length]
          const [q, ans, diff2, exp] = pick
          questions.push(tf(makeId(subjectCode, t.code, idx), q, ans, diff2, exp))
        }
      }

      if (t.code === 'trig') {
        const special = [
          { angle: 0, sin: 0, cos: 1, tan: 0 },
          { angle: 30, sin: '1/2', cos: 'sqrt(3)/2', tan: '1/sqrt(3)' },
          { angle: 45, sin: 'sqrt(2)/2', cos: 'sqrt(2)/2', tan: '1' },
          { angle: 60, sin: 'sqrt(3)/2', cos: '1/2', tan: 'sqrt(3)' },
          { angle: 90, sin: 1, cos: 0, tan: undefined },
        ]
        const item = special[(idx - 1) % special.length]
        const ask = idx % 2 === 0 ? 'sin' : 'cos'
        const correct = ask === 'sin' ? item.sin : item.cos
        if (type === 'mcq') {
          const wrongPool = []
          for (const s of special) {
            wrongPool.push(ask === 'sin' ? s.sin : s.cos)
          }
          const wrong = wrongPool.filter((x) => x !== correct)
          const options = ensureUniqueOptions(correct, [wrong[0], wrong[1], wrong[2]].filter(Boolean))
          const q = `Evaluate ${ask}(${item.angle}°).`
          const explanation =
            ask === 'sin'
              ? `For ${item.angle}°, the standard value of sin is ${correct}.`
              : `For ${item.angle}°, the standard value of cos is ${correct}.`
          questions.push(mcq(makeId(subjectCode, t.code, idx), q, options, correct, difficulty, explanation))
        } else {
          const cases = [
            ['sin^2θ + cos^2θ = 1 for all angles θ.', true, 'easy', 'This is the Pythagorean identity.'],
            ['tan(45°) = 0.', false, 'easy', 'tan(45°) = 1.'],
            ['cos(60°) = 1/2.', true, 'easy', 'Standard value.'],
            ['sin(-θ) = sin(θ).', false, 'medium', 'Sine is odd: sin(-θ) = -sin(θ).'],
            ['cos(-θ) = cos(θ).', true, 'medium', 'Cosine is even.'],
            ['If sinθ is positive, then θ must be in Quadrant I only.', false, 'hard', 'sinθ is positive in Quadrants I and II.'],
            ['The value of tan(90°) is defined.', false, 'easy', 'tan(90°) is undefined (cos 90° = 0).'],
            ['sin(0°) = 0.', true, 'easy', 'Standard value.'],
            ['cos(0°) = 0.', false, 'easy', 'cos(0°) = 1.'],
            ['cotangent is the reciprocal of tangent.', true, 'easy', 'cotθ = 1/tanθ where tanθ != 0.'],
          ]
          const pick = cases[(idx - 1) % cases.length]
          const [q, ans, diff2, exp] = pick
          questions.push(tf(makeId(subjectCode, t.code, idx), q, ans, diff2, exp))
        }
      }

      if (t.code === 'prob') {
        const bag = (() => {
          const red = 3 + ((idx * 2) % 7) // 3..9
          const blue = 2 + ((idx * 3) % 6) // 2..7
          return { red, blue, total: red + blue }
        })()
        const correct = formatFraction(bag.red, bag.total)
        if (type === 'mcq') {
          const alt = []
          alt.push(formatFraction(bag.blue, bag.total))
          alt.push(formatFraction(bag.red - 1, bag.total))
          alt.push(formatFraction(bag.red + 1, bag.total))
          alt.push(formatFraction(bag.red, bag.total - 1))
          const options = ensureUniqueOptions(correct, alt)
          const q = `A bag has ${bag.red} red balls and ${bag.blue} blue balls. What is P(draw a red ball)?`
          const explanation = `Total balls = ${bag.total}. Probability of red = ${bag.red}/${bag.total} = ${correct}.`
          questions.push(mcq(makeId(subjectCode, t.code, idx), q, options, correct, difficulty, explanation))
        } else {
          const cases = [
            ['If two events are independent, then P(A and B) = P(A) * P(B).', true, 'easy', 'Definition of independence.'],
            ['For any event A, P(A) + P(not A) = 1.', true, 'easy', 'Complement rule.'],
            ['If P(A) = 0, then event A is impossible.', true, 'easy', 'Probability zero means it cannot occur.'],
            ['Two events are mutually exclusive if they can occur together sometimes.', false, 'medium', 'Mutually exclusive means they cannot both occur at the same time.'],
            ['Conditional probability P(A|B) equals P(A) when A and B are independent.', true, 'medium', 'Independence implies P(A|B)=P(A).'],
            ['In a fair die, P(5) = 1/6.', true, 'easy', 'One favorable outcome out of six.'],
            ['The probability of any event is always greater than 1.', false, 'easy', 'Probability is in [0,1].'],
            ['If event A is a subset of B, then P(A) can be greater than P(B).', false, 'medium', 'A ⊂ B implies P(A) <= P(B).'],
            ['If P(B) = 0, then P(A|B) is defined.', false, 'hard', 'Conditional probability requires P(B) > 0.'],
            ['If P(A) = 1, then A must always happen.', true, 'easy', 'Sure event.'],
          ]
          const pick = cases[(idx - 1) % cases.length]
          const [q, ans, diff2, exp] = pick
          questions.push(tf(makeId(subjectCode, t.code, idx), q, ans, diff2, exp))
        }
      }

      if (t.code === 'stat') {
        // Build a simple dataset of 5 numbers.
        const base = (idx * 3) % 10 // 0..9
        const data = [base + 1, base + 3, base + 5, base + 7, base + 9]
        const mean = data.reduce((a, b) => a + b, 0) / data.length
        const sorted = [...data].sort((a, b) => a - b)
        const median = sorted[2]
        const qKind = idx % 3

        if (type === 'mcq') {
          if (qKind === 0) {
            const correct = String(mean)
            const wrong = [mean + 1, mean - 1, mean + 2, mean - 2]
            const options = ensureUniqueOptions(correct, wrong)
            const q = `The data set is ${data.join(', ')}. What is the mean?`
            const explanation = `Sum = ${data.reduce((a, b) => a + b, 0)}. Mean = Sum/5 = ${mean}.`
            questions.push(mcq(makeId(subjectCode, t.code, idx), q, options, correct, difficulty, explanation))
          } else if (qKind === 1) {
            const correct = String(median)
            const wrong = [median + 1, median - 1, median + 2]
            const options = ensureUniqueOptions(correct, wrong)
            const q = `The data set is ${data.join(', ')}. What is the median?`
            const explanation = `When arranged in order, the middle value (3rd of 5) is ${median}.`
            questions.push(mcq(makeId(subjectCode, t.code, idx), q, options, correct, difficulty, explanation))
          } else {
            // Mode with duplicates: adjust one element.
            const d2 = [...data]
            d2[2] = d2[1] // create a mode
            const modeVal = d2[1]
            const correct = String(modeVal)
            const wrong = [modeVal + 1, modeVal - 1, modeVal + 2]
            const options = ensureUniqueOptions(correct, wrong)
            const q = `For the data set ${d2.join(', ')}, what is the mode?`
            const explanation = `The value that appears most often is ${modeVal}.`
            questions.push(mcq(makeId(subjectCode, t.code, idx), q, options, correct, difficulty, explanation))
          }
        } else {
          const cases = [
            ['The mean of a symmetric distribution equals the median.', true, 'medium', 'For symmetric distributions, mean = median.'],
            ['A higher standard deviation means data is less spread out.', false, 'easy', 'Higher standard deviation means more spread.'],
            ['The median is affected by extreme outliers.', false, 'medium', 'Median is more robust to outliers than mean.'],
            ['Correlation measures causation.', false, 'hard', 'Correlation does not imply causation.'],
            ['If all values in a data set are the same, the standard deviation is 0.', true, 'easy', 'No variation.'],
            ['The range is the maximum value minus the minimum value.', true, 'easy', 'By definition.'],
            ['Mode is always unique for any data set.', false, 'medium', 'A data set can have multiple modes or none.'],
            ['If an event is certain, its probability is 1.', true, 'easy', 'Certainty gives probability 1.'],
            ['The median can be found by sorting the data and taking the middle value.', true, 'easy', 'Standard method.'],
            ['The mean is always an actual value in the data set.', false, 'medium', 'Mean can be between values.'],
          ]
          const pick = cases[(idx - 1) % cases.length]
          const [q, ans, diff2, exp] = pick
          questions.push(tf(makeId(subjectCode, t.code, idx), q, ans, diff2, exp))
        }
      }
    }

    subject.topics.push({ name: t.name, questions })
  }

  return subject
}

function buildPhysics() {
  const subject = { name: 'Physics', topics: [] }
  const topics = [
    { name: 'Mechanics', code: 'mech' },
    { name: 'Thermodynamics', code: 'thermo' },
    { name: 'Electromagnetism', code: 'em' },
    { name: 'Optics', code: 'optics' },
    { name: 'Modern Physics', code: 'modern' },
  ]
  const subjectCode = 'phys'

  for (const t of topics) {
    const questions = []
    for (let i = 1; i <= 30; i++) {
      const difficulty = i <= 10 ? 'easy' : i <= 20 ? 'medium' : 'hard'
      const type = i % 3 === 0 ? 'tf' : 'mcq'

      if (t.code === 'mech') {
        if (type === 'mcq') {
          const m = 1 + ((i * 7) % 7) // 1..7
          const a = 1 + ((i * 5) % 8) // 1..8
          const F = m * a
          const q = `A mass of ${m} kg experiences an acceleration of ${a} m/s². What is the force?`
          const correct = String(F)
          const options = ensureUniqueOptions(correct, [F + 2, F - 1, F + 5].filter((x) => x >= 0))
          const explanation = `Use Newton's 2nd law: F = m a = ${m} × ${a} = ${F} N.`
          questions.push(mcq(makeId(subjectCode, t.code, i), q, options, correct, difficulty, explanation))
        } else {
          const cases = [
            ['If no net external force acts on an object, its momentum remains constant.', true, 'medium', 'Conservation of momentum (Newton\'s 1st law).'],
            ['Kinetic energy depends on velocity.', true, 'easy', 'Kinetic energy is (1/2)mv².'],
            ['Work done on an object equals change in kinetic energy.', true, 'medium', 'By the work-energy theorem.'],
            ['If velocity is zero, momentum is also zero.', true, 'easy', 'p = mv.'],
            ['If an object is moving at constant velocity, the net force on it is zero.', true, 'easy', 'Acceleration is zero ⇒ Fnet = ma = 0.'],
            ['A force always causes acceleration in the direction of the force.', false, 'hard', 'Acceleration depends on net force and mass; also direction can differ with other forces.'],
            ['Potential energy increases when an object is raised against gravity.', true, 'easy', 'Height increases ⇒ PE increases.'],
            ['Friction always increases mechanical energy.', false, 'medium', 'Friction dissipates energy (usually as heat).'],
            ['Momentum is a scalar quantity.', false, 'easy', 'Momentum is a vector.'],
            ['For uniform circular motion, the speed can be constant while acceleration changes direction.', true, 'medium', 'Acceleration is centripetal and changes direction.'],
          ]
          const pick = cases[(i - 1) % cases.length]
          const [q, ans, diff2, exp] = pick
          questions.push(tf(makeId(subjectCode, t.code, i), q, ans, diff2, exp))
        }
      }

      if (t.code === 'thermo') {
        if (type === 'mcq') {
          const m = 2 + ((i * 3) % 5) // 2..6
          const c = 200 + ((i * 11) % 5) * 50 // 200..400
          const dT = 10 + ((i * 7) % 8) * 5 // 10..45
          const Q = m * c * dT // Joules
          const q = `Heat required to raise temperature: A substance of mass ${m} kg has specific heat ${c} J/kg·°C and temperature change ${dT}°C. Find Q. (Use Q = mcΔT)`
          const correct = String(Q)
          const options = ensureUniqueOptions(correct, [Q + 10000, Q - 5000, Q + 20000].filter((x) => x >= 0))
          const explanation = `Q = m c ΔT = ${m} × ${c} × ${dT} = ${Q} J.`
          questions.push(mcq(makeId(subjectCode, t.code, i), q, options, correct, difficulty, explanation))
        } else {
          const cases = [
            ['Temperature in Kelvin is always greater than temperature in Celsius.', true, 'easy', 'K = °C + 273.15.'],
            ['Heat flows from colder object to hotter object spontaneously.', false, 'easy', 'It flows from hot to cold.'],
            ['In an ideal gas, average kinetic energy depends only on temperature.', true, 'medium', 'KE depends on T.'],
            ['The first law of thermodynamics is: ΔU = Q - W (work done by the system).', true, 'medium', 'Sign convention: common form.'],
            ['If a process is adiabatic, Q = 0.', true, 'easy', 'No heat exchange.'],
            ['Kelvin scale starts at absolute zero.', true, 'easy', 'Absolute zero is 0 K.'],
            ['Entropy always decreases in any isolated system.', false, 'hard', 'Second law: entropy of isolated system never decreases.'],
            ['In an isothermal process for an ideal gas, temperature remains constant.', true, 'easy', 'By definition.'],
            ['PV diagram: for an isobaric process, pressure is constant.', true, 'easy', 'Isobaric means constant P.'],
            ['Latent heat is the heat required for a phase change at constant temperature.', true, 'medium', 'By definition.'],
          ]
          const pick = cases[(i - 1) % cases.length]
          const [q, ans, diff2, exp] = pick
          questions.push(tf(makeId(subjectCode, t.code, i), q, ans, diff2, exp))
        }
      }

      if (t.code === 'em') {
        if (type === 'mcq') {
          const R = 2 + ((i * 5) % 8) // 2..9
          const I = 0.5 + ((i * 3) % 7) * 0.5 // 0.5..3.5
          const V = R * I
          const correct = V.toFixed(1)
          const options = ensureUniqueOptions(correct, [Number(correct) + 1, Number(correct) - 0.5, Number(correct) + 0.5].map((x) => x.toFixed(1)))
          const q = `Using Ohm's law, if R = ${R} Ω and I = ${I.toFixed(1)} A, what is the voltage V? (V = I R)`
          const explanation = `V = I R = ${I.toFixed(1)} × ${R} = ${correct} V.`
          questions.push(mcq(makeId(subjectCode, t.code, i), q, options, correct, difficulty, explanation))
        } else {
          const cases = [
            ['Electric current flows from higher potential to lower potential.', true, 'easy', 'Conventional current direction.'],
            ['Resistance increases when temperature decreases for a metal wire.', false, 'medium', 'For metals, resistance usually increases with temperature.'],
            ['In a series circuit, the same current flows through all components.', true, 'easy', 'Series circuit property.'],
            ['In a parallel circuit, the voltage across each branch is the same.', true, 'easy', 'Parallel circuit property.'],
            ['Magnetic field lines form closed loops.', true, 'medium', 'No start/end; represent field direction.'],
            ['The unit of electric resistance is the ohm (Ω).', true, 'easy', 'By definition.'],
            ['If two charges are both positive, the force between them is attractive.', false, 'easy', 'Like charges repel.'],
            ['The direction of magnetic force depends on current direction and magnetic field direction.', true, 'medium', 'Right-hand rule.'],
            ['Ohm\'s law states V = I / R.', false, 'easy', 'Ohm\'s law is V = I R.'],
            ['A conductor has very high resistance compared to an insulator.', false, 'easy', 'Conductor has low resistance.'],
          ]
          const pick = cases[(i - 1) % cases.length]
          const [q, ans, diff2, exp] = pick
          questions.push(tf(makeId(subjectCode, t.code, i), q, ans, diff2, exp))
        }
      }

      if (t.code === 'optics') {
        if (type === 'mcq') {
          const f = 10 + ((i * 7) % 10) // 10..19
          const objDistance = 2 * f // ensure v is 2f for convex
          const di = 2 * f
          const q = `A convex lens has focal length f = ${f} cm. If the object is placed at 2f, what is the image distance?`
          const correct = `${di} cm`
          const options = shuffle([`${f} cm`, `${objDistance} cm`, `${di} cm`, `${di + 5} cm`])
          const explanation = `Using the lens property: when object distance is 2f, image forms at 2f. So di = 2f = ${di} cm.`
          questions.push(mcq(makeId(subjectCode, t.code, i), q, options, correct, difficulty, explanation))
        } else {
          const cases = [
            ['In reflection, the angle of incidence equals the angle of reflection.', true, 'easy', 'Law of reflection.'],
            ['A convex lens always produces a real, inverted image for any object position.', false, 'medium', 'For object within f, image is virtual and upright.'],
            ['Light travels in straight lines in a uniform medium.', true, 'easy', 'Geometric optics assumption.'],
            ['Refraction occurs because the speed of light changes in different media.', true, 'medium', 'Different refractive index means different speed.'],
            ['The image formed by a plane mirror is always virtual.', true, 'easy', 'Plane mirrors form virtual images.'],
            ['If the refractive index of a medium is higher, light speeds up inside it.', false, 'easy', 'It slows down in a higher refractive index medium.'],
            ['Mirrors can magnify objects.', true, 'medium', 'Curved mirrors can form magnified images.'],
            ['The focal length of a lens is the distance from the optical center to the focus.', true, 'easy', 'By definition.'],
            ['Snell\'s law relates angles of incidence and refraction.', true, 'medium', 'n1 sinθ1 = n2 sinθ2.'],
            ['A rainbow is formed by refraction only.', false, 'hard', 'It involves refraction and internal reflection.'],
          ]
          const pick = cases[(i - 1) % cases.length]
          const [q, ans, diff2, exp] = pick
          questions.push(tf(makeId(subjectCode, t.code, i), q, ans, diff2, exp))
        }
      }

      if (t.code === 'modern') {
        if (type === 'mcq') {
          const T = 2 + ((i * 3) % 4) // 2..5
          const N0 = 64
          const t = T * 2 // 2 half-lives
          const N = N0 * Math.pow(0.5, t / T)
          const correct = String(N)
          const options = ensureUniqueOptions(correct, [N + 4, N - 8, N + 16].filter((x) => x >= 0))
          const q = `A radioactive sample has half-life ${T} years. If you start with ${N0} nuclei, how many nuclei remain after ${t} years? (Use N = N0 (1/2)^(t/T))`
          const explanation = `Here t/T = ${t}/${T} = 2 half-lives. So N = ${64}×(1/2)^2 = ${N}.`
          questions.push(mcq(makeId(subjectCode, t.code, i), q, options, correct, difficulty, explanation))
        } else {
          const cases = [
            ['The stopping potential in the photoelectric effect depends on the frequency of incident light.', true, 'medium', 'Higher frequency increases kinetic energy and stopping potential.'],
            ['Photoelectric effect shows that light intensity affects electron energy in a simple linear way.', false, 'hard', 'Electron maximum kinetic energy depends on frequency, not intensity.'],
            ['Radioactive decay is random but follows predictable half-life statistics.', true, 'medium', 'Individual events are random; averages are predictable.'],
            ['Half-life means the time for the activity to increase.', false, 'easy', 'It is the time for quantity/activity to fall to half.'],
            ['The threshold frequency is the minimum frequency needed to release electrons.', true, 'easy', 'By definition.'],
            ['In nuclear fission, a heavy nucleus splits into smaller nuclei.', true, 'easy', 'Fission = splitting.'],
            ['In nuclear fusion, energy is released when light nuclei combine.', true, 'easy', 'Fusion of light nuclei releases energy.'],
            ['Radioactive emissions are always identical in energy.', false, 'medium', 'They vary depending on decay process.'],
            ['Alpha particles are positively charged.', true, 'easy', 'Alpha = 2 protons + 2 neutrons (charge +2e).'],
            ['Beta particles are neutral.', false, 'easy', 'Beta are electrons (negative charge) or positrons (positive).'],
          ]
          const pick = cases[(i - 1) % cases.length]
          const [q, ans, diff2, exp] = pick
          questions.push(tf(makeId(subjectCode, t.code, i), q, ans, diff2, exp))
        }
      }
    }

    subject.topics.push({ name: t.name, questions })
  }

  return subject
}

function buildChem() {
  const subject = { name: 'Chemistry', topics: [] }
  const topics = [
    { name: 'Organic', code: 'org' },
    { name: 'Inorganic', code: 'inorg' },
    { name: 'Physical', code: 'phys' },
    { name: 'Analytical', code: 'anal' },
    { name: 'Biochemistry', code: 'bio' },
  ]
  const subjectCode = 'chem'

  for (const t of topics) {
    const questions = []
    for (let i = 1; i <= 30; i++) {
      const difficulty = i <= 10 ? 'easy' : i <= 20 ? 'medium' : 'hard'
      const type = i % 3 === 0 ? 'tf' : 'mcq'

      if (t.code === 'org') {
        if (type === 'mcq') {
          const n = 2 + (i % 7) // 2..8
          const alkaneFormula = `C${n}H${2 * n + 2}`
          const q = `Which of the following is an alkane for n = ${n}? (Alkanes: CnH2n+2)`
          const options = shuffle([
            alkaneFormula,
            `C${n}H${2 * n}`,
            `C${n}H${2 * n + 4}`,
            `C${n + 1}H${2 * (n + 1) + 2}`,
          ]).slice(0, 4)
          const explanation = `For an alkane: CnH2n+2. So when n = ${n}, the formula is C${n}H${2 * n + 2}.`
          questions.push(mcq(makeId(subjectCode, t.code, i), q, options, alkaneFormula, difficulty, explanation))
        } else {
          const cases = [
            ['Alkanes contain only single bonds between carbon atoms.', true, 'easy', 'They are saturated hydrocarbons with single C-C bonds.'],
            ['Alkenes have at least one double bond.', true, 'easy', 'Alkenes contain C=C double bonds.'],
            ['Ethene and ethyne are both alkanes.', false, 'easy', 'Ethene is an alkene; ethyne is an alkyne.'],
            ['A homologous series has the same functional group and similar chemical properties.', true, 'medium', 'By definition of homologous series.'],
            ['In organic chemistry, functional groups determine the reactivity of molecules.', true, 'medium', 'Functional groups control characteristic reactions.'],
            ['Alkanes are unsaturated hydrocarbons.', false, 'easy', 'They are saturated.'],
            ['In IUPAC naming, the longest carbon chain determines the base name.', true, 'medium', 'Base chain is longest.'],
            ['Benzene is an example of an alkene.', false, 'medium', 'Benzene is an aromatic compound (C6H6), not an alkene.'],
            ['An ester is formed by condensation of an acid and an alcohol.', true, 'medium', 'Esterification forms esters + water.'],
            ['Carboxylic acids contain the -COOH group.', true, 'easy', 'By definition.'],
          ]
          const pick = cases[(i - 1) % cases.length]
          const [q, ans, diff2, exp] = pick
          questions.push(tf(makeId(subjectCode, t.code, i), q, ans, diff2, exp))
        }
      }

      if (t.code === 'inorg') {
        if (type === 'mcq') {
          const ionic = ['NaCl', 'MgO', 'CaCl2', 'K2SO4']
          const covalent = ['CO2', 'CH4', 'H2O', 'NH3']
          const pickI = ionic[(i - 1) % ionic.length]
          const pickC = covalent[(i + 1) % covalent.length]
          const options = shuffle([pickI, pickC, ionic[(i + 1) % ionic.length], covalent[(i + 2) % covalent.length]]).slice(0, 4)
          const q = 'Which of the following is an ionic compound?'
          const explanation = `${pickI} contains metal + non-metal ions, forming an ionic lattice.`
          questions.push(mcq(makeId(subjectCode, t.code, i), q, options, pickI, difficulty, explanation))
        } else {
          const cases = [
            ['Ionic bonding involves transfer of electrons.', true, 'easy', 'Ions form by electron transfer.'],
            ['Covalent bonds form due to complete transfer of electrons.', false, 'easy', 'Covalent involves sharing electrons.'],
            ['The pH of a neutral solution at 25°C is 7.', true, 'easy', 'Neutral pH = 7.'],
            ['Metals generally have higher electronegativity than non-metals.', false, 'medium', 'Metals have lower electronegativity.'],
            ['An acid tastes sour.', true, 'easy', 'Common observation.'],
            ['All salts are neutral in water.', false, 'hard', 'Depends on conjugate acid/base strength.'],
            ['Group 1 elements form +1 ions.', true, 'easy', 'They lose one electron.'],
            ['Halogens form -1 ions.', true, 'easy', 'They gain one electron.'],
            ['A catalyst increases the rate of a chemical reaction without being consumed.', true, 'medium', 'Catalysts provide alternate pathways.'],
            ['pH decreases when concentration of H+ increases.', true, 'easy', 'pH = -log[H+].'],
          ]
          const pick = cases[(i - 1) % cases.length]
          const [q, ans, diff2, exp] = pick
          questions.push(tf(makeId(subjectCode, t.code, i), q, ans, diff2, exp))
        }
      }

      if (t.code === 'phys') {
        if (type === 'mcq') {
          // Boyle's law: P1V1 = P2V2
          const P1 = 2 + ((i * 5) % 6) // 2..7
          const V1 = 3 + ((i * 3) % 6) // 3..8
          const V2 = 2 + ((i * 7) % 6) // 2..7
          const P2 = (P1 * V1) / V2
          const q = `For an ideal gas at constant temperature, P1V1 = P2V2. If P1 = ${P1} atm, V1 = ${V1} L and V2 = ${V2} L, what is P2?`
          const correct = P2 % 1 === 0 ? String(P2) : P2.toFixed(2)
          const options = shuffle([
            correct,
            typeof P2 === 'number' ? (P2 + 1).toFixed(2) : String(P2 + 1),
            typeof P2 === 'number' ? (P2 - 0.5).toFixed(2) : String(P2 - 0.5),
            typeof P2 === 'number' ? (P2 * 2).toFixed(2) : String(P2 * 2),
          ]).slice(0, 4)
          const explanation = `Using Boyle's law: P2 = (P1×V1)/V2 = (${P1}×${V1})/${V2} = ${correct} atm.`
          questions.push(mcq(makeId(subjectCode, t.code, i), q, options, correct, difficulty, explanation))
        } else {
          const cases = [
            ['For Boyle\'s law, pressure is inversely proportional to volume when temperature is constant.', true, 'medium', 'P ∝ 1/V at constant T.'],
            ['In an exothermic reaction, heat flows from surroundings to system.', false, 'medium', 'Heat is released to surroundings.'],
            ['At equilibrium, forward and reverse reaction rates are equal.', true, 'easy', 'Dynamic equilibrium.'],
            ['A catalyst changes the equilibrium position.', false, 'hard', 'Catalyst affects rates, not equilibrium constant.'],
            ['For an ideal gas, internal energy depends only on temperature.', true, 'medium', 'Ideal gas property.'],
            ['Increasing temperature always decreases the rate of reaction.', false, 'easy', 'Usually increases rate.'],
            ['When gas volume decreases at constant temperature, pressure increases.', true, 'easy', 'Boyle\'s law.'],
            ['Le Châtelier\'s principle predicts system response to disturbances.', true, 'medium', 'By definition.'],
            ['Entropy is a measure of randomness.', true, 'easy', 'Concept of entropy.'],
            ['At equilibrium, concentrations of reactants and products remain constant.', true, 'medium', 'Macroscopic concentrations remain constant.'],
          ]
          const pick = cases[(i - 1) % cases.length]
          const [q, ans, diff2, exp] = pick
          questions.push(tf(makeId(subjectCode, t.code, i), q, ans, diff2, exp))
        }
      }

      if (t.code === 'anal') {
        if (type === 'mcq') {
          const C = 0.1 + ((i % 5) * 0.05) // 0.10..0.30
          const V = 25 + (i % 5) * 5 // 25..45 mL
          const moles = C * (V / 1000)
          const correct = moles.toFixed(3)
          const wrongs = [moles + 0.01, moles - 0.005, moles + 0.02].map((x) => Math.max(0, x).toFixed(3))
          const options = ensureUniqueOptions(correct, wrongs)
          const q = `In a titration, a  ${V} mL sample of acid has concentration ${C} mol/L. What is the number of moles in the sample? (n = C×V)`
          const explanation = `V = ${V}/1000 = ${V / 1000} L. n = ${C} × ${V / 1000} = ${correct} mol.`
          questions.push(mcq(makeId(subjectCode, t.code, i), q, options, correct, difficulty, explanation))
        } else {
          const cases = [
            ['At the end-point of a titration, the indicator changes color.', true, 'easy', 'Endpoint is when indicator indicates completion.'],
            ['A titration is based on neutralization reactions.', true, 'medium', 'Many titrations use neutralization.'],
            ['Chromatography separates components based on differences in movement.', true, 'medium', 'By distribution between stationary/mobile phases.'],
            ['Indicators have no role in titrations.', false, 'easy', 'Indicators help detect endpoint.'],
            ['A burette is used to measure the volume of titrant accurately.', true, 'easy', 'Burette measures dispensed titrant.'],
            ['pH 7 is acidic.', false, 'easy', 'Neutral is 7.'],
            ['Volumetric analysis aims for accurate volume measurements.', true, 'easy', 'By definition.'],
            ['The equivalence point is always the same as the endpoint.', false, 'hard', 'Endpoint is indicator reading; equivalence is stoichiometric condition.'],
            ['Indicators are selected based on the pH range of the titration.', true, 'easy', 'Choose suitable transition range.'],
            ['Titration results are affected by temperature and concentration.', true, 'medium', 'These affect reaction equilibrium/rate.'],
          ]
          const pick = cases[(i - 1) % cases.length]
          const [q, ans, diff2, exp] = pick
          questions.push(tf(makeId(subjectCode, t.code, i), q, ans, diff2, exp))
        }
      }

      if (t.code === 'bio') {
        if (type === 'mcq') {
          const pick = i % 6
          if (pick === 0) {
            const q = 'Which of the following is an enzyme?'
            const options = shuffle(['Amylase', 'Glucose', 'Carbon dioxide', 'Water']).slice(0, 4)
            const answer = 'Amylase'
            questions.push(mcq(makeId(subjectCode, t.code, i), q, options, answer, difficulty, 'An enzyme is a biological catalyst that speeds up reactions. Amylase catalyzes starch digestion.'))
          } else if (pick === 1) {
            const q = 'DNA contains which sugar?'
            const options = shuffle(['Ribose', 'Deoxyribose', 'Fructose', 'Galactose']).slice(0, 4)
            const answer = 'Deoxyribose'
            questions.push(mcq(makeId(subjectCode, t.code, i), q, options, answer, difficulty, 'DNA uses deoxyribose as its sugar component.'))
          } else if (pick === 2) {
            const q = 'Which base pairs with adenine in DNA?'
            const options = shuffle(['Thymine', 'Cytosine', 'Guanine', 'Uracil']).slice(0, 4)
            const answer = 'Thymine'
            questions.push(mcq(makeId(subjectCode, t.code, i), q, options, answer, difficulty, 'In DNA, A pairs with T via hydrogen bonds.'))
          } else if (pick === 3) {
            const q = 'Proteins are polymers made of which monomers?'
            const options = shuffle(['Nucleotides', 'Amino acids', 'Monosaccharides', 'Fatty acids']).slice(0, 4)
            const answer = 'Amino acids'
            questions.push(mcq(makeId(subjectCode, t.code, i), q, options, answer, difficulty, 'Proteins are made of amino acids linked by peptide bonds.'))
          } else if (pick === 4) {
            const q = 'Enzymes generally work best at which conditions?'
            const options = shuffle(['Extreme pH and extreme temperature always', 'Their optimum pH and temperature', 'Any pH always', 'At 0°C only']).slice(0, 4)
            const answer = 'Their optimum pH and temperature'
            questions.push(mcq(makeId(subjectCode, t.code, i), q, options, answer, difficulty, 'Each enzyme has an optimum temperature and pH for maximum activity.'))
          } else {
            const q = 'Which molecule carries genetic instructions in many organisms?'
            const options = shuffle(['RNA', 'ATP only', 'Cholesterol', 'Glycogen']).slice(0, 4)
            const answer = 'RNA'
            questions.push(mcq(makeId(subjectCode, t.code, i), q, options, answer, difficulty, 'RNA plays key roles in carrying and using genetic information (e.g., mRNA).'))
          }
        } else {
          const cases = [
            ['In DNA, thymine pairs with adenine.', true, 'easy', 'A-T base pairing.'],
            ['RNA contains uracil instead of thymine.', true, 'easy', 'RNA uses U.'],
            ['Enzymes increase activation energy of reactions.', false, 'medium', 'Enzymes decrease activation energy.'],
            ['Proteins are made from amino acids.', true, 'easy', 'By definition.'],
            ['Catalase is an example of a protein enzyme.', true, 'medium', 'Catalase catalyzes breakdown of hydrogen peroxide.'],
            ['Amino acids are linked by peptide bonds in proteins.', true, 'easy', 'Peptide bonds connect amino acids.'],
            ['DNA and RNA have the same sugar.', false, 'medium', 'DNA has deoxyribose; RNA has ribose.'],
            ['All enzymes work at the same temperature.', false, 'hard', 'Each enzyme has its own optimum.'],
            ['RNA can serve as a catalyst in some cases.', true, 'hard', 'Ribozymes demonstrate RNA catalysis.'],
            ['DNA is usually single-stranded in cells.', false, 'easy', 'DNA is typically double-stranded.'],
          ]
          const pick = cases[(i - 1) % cases.length]
          const [q, ans, diff2, exp] = pick
          questions.push(tf(makeId(subjectCode, t.code, i), q, ans, diff2, exp))
        }
      }
    }
    subject.topics.push({ name: t.name, questions })
  }

  return subject
}

function buildBio() {
  const subject = { name: 'Biology', topics: [] }
  const topics = [
    { name: 'Genetics', code: 'gen' },
    { name: 'Human Physiology', code: 'phys' },
    { name: 'Plant Biology', code: 'plant' },
    { name: 'Ecology', code: 'eco' },
    { name: 'Microbiology', code: 'micro' },
  ]
  const subjectCode = 'bio'

  for (const t of topics) {
    const questions = []
    for (let i = 1; i <= 30; i++) {
      const difficulty = i <= 10 ? 'easy' : i <= 20 ? 'medium' : 'hard'
      const type = i % 3 === 0 ? 'tf' : 'mcq'

      if (t.code === 'gen') {
        if (type === 'mcq') {
          const qType = i % 3
          if (qType === 0) {
            const q = 'Cross: Aa × Aa (A dominant). What fraction of offspring are homozygous recessive?'
            const answer = '1/4'
            const options = shuffle(['1/4', '1/2', '3/4', '1']).slice(0, 4)
            const explanation = 'Punnett square gives 1 AA : 2 Aa : 1 aa. Homozygous recessive (aa) = 1/4.'
            questions.push(mcq(makeId(subjectCode, t.code, i), q, options, answer, difficulty, explanation))
          } else if (qType === 1) {
            const q = 'In a dihybrid cross, the phenotypic ratio of A_B_ : A_bb : aaB_ : aabb is which?'
            // Standard 9:3:3:1 breakdown (assuming complete dominance)
            const answer = '9:3:3:1'
            const options = shuffle(['9:3:3:1', '3:1', '1:2:1', '1:1:1:1']).slice(0, 4)
            const explanation = 'With independent assortment and complete dominance, dihybrid phenotypic ratio is 9:3:3:1.'
            questions.push(mcq(makeId(subjectCode, t.code, i), q, options, answer, difficulty, explanation))
          } else {
            const q = 'If an organism shows a dominant phenotype, which genotypes could it have?'
            const answer = 'AA or Aa'
            const options = shuffle(['AA or Aa', 'Only aa', 'Only AA', 'Aa only']).slice(0, 4)
            const explanation = 'Dominant phenotype occurs when at least one dominant allele is present.'
            questions.push(mcq(makeId(subjectCode, t.code, i), q, options, answer, difficulty, explanation))
          }
        } else {
          const cases = [
            ['Alleles are different forms of the same gene.', true, 'easy', 'By definition.'],
            ['A homozygous dominant genotype means both alleles are dominant.', true, 'easy', 'Genotype AA (for dominant allele A).'],
            ['A recessive phenotype always has genotype AA.', false, 'easy', 'Recessive phenotype requires homozygous recessive (aa).'],
            ['In Mendelian inheritance, complete dominance means heterozygote shows dominant phenotype.', true, 'easy', 'Heterozygote phenotype matches dominant.'],
            ['Genes always assort randomly during gamete formation.', false, 'hard', 'Independent assortment is assumed for unlinked genes; not always for linked genes.'],
            ['Punnett squares help predict genotype frequencies from crosses.', true, 'easy', 'They model combinations of alleles.'],
            ['Crossing two heterozygotes always produces all offspring with the dominant phenotype.', false, 'medium', 'There can be recessive phenotypes.'],
            ['Mutation can introduce new alleles.', true, 'medium', 'Mutations change genetic material.'],
            ['Phenotype refers to observable traits.', true, 'easy', 'Observable characteristics.'],
            ['Genotype refers to the genetic makeup (allele combination).', true, 'easy', 'Allele combination is genotype.'],
          ]
          const pick = cases[(i - 1) % cases.length]
          const [q, ans, diff2, exp] = pick
          questions.push(tf(makeId(subjectCode, t.code, i), q, ans, diff2, exp))
        }
      }

      if (t.code === 'phys') {
        if (type === 'mcq') {
          const q = i % 5
          if (q === 0) {
            const question = 'Which component of blood carries oxygen in humans?'
            const answer = 'Hemoglobin in red blood cells'
            const options = shuffle(['Plasma', 'Hemoglobin in red blood cells', 'Platelets only', 'White blood cells']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'Hemoglobin binds oxygen in red blood cells.'))
          } else if (q === 1) {
            const question = 'The main organ responsible for gas exchange in humans is the:'
            const answer = 'Lungs'
            const options = shuffle(['Liver', 'Lungs', 'Heart', 'Kidneys']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'Gas exchange occurs in alveoli inside the lungs.'))
          } else if (q === 2) {
            const question = 'Which organ secretes bile to help digest fats?'
            const answer = 'Liver'
            const options = shuffle(['Stomach', 'Liver', 'Pancreas', 'Small intestine']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'The liver produces bile, which emulsifies fats.'))
          } else if (q === 3) {
            const question = 'Which part of the brain controls balance and coordination?'
            const answer = 'Cerebellum'
            const options = shuffle(['Cerebellum', 'Medulla', 'Cerebrum', 'Hypothalamus']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'Cerebellum helps with coordination and balance.'))
          } else {
            const question = 'Which gland produces insulin?'
            const answer = 'Pancreas'
            const options = shuffle(['Thyroid', 'Pancreas', 'Adrenal glands', 'Pituitary']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'Insulin is produced by beta cells in the pancreas.'))
          }
        } else {
          const cases = [
            ['The trachea is part of the respiratory system.', true, 'easy', 'Trachea carries air to the lungs.'],
            ['The stomach is the site where most protein digestion begins.', true, 'medium', 'Proteins start breaking down in the stomach.'],
            ['The heart pumps blood through arteries and veins.', true, 'easy', 'Arteries carry blood away; veins carry blood back.'],
            ['Red blood cells contain a nucleus.', false, 'easy', 'Mammalian RBCs generally do not have nuclei.'],
            ['The small intestine is the main site of nutrient absorption.', true, 'easy', 'Most absorption occurs in small intestine.'],
            ['Urine is produced by the pancreas.', false, 'easy', 'Kidneys produce urine.'],
            ['Sweat helps cool the body by evaporation.', true, 'easy', 'Evaporation removes heat.'],
            ['Antibodies are produced by white blood cells called lymphocytes.', true, 'medium', 'B lymphocytes produce antibodies.'],
            ['The cerebrum controls breathing.', false, 'hard', 'Breathing is controlled mainly by medulla.'],
            ['Insulin lowers blood glucose levels.', true, 'easy', 'Insulin promotes glucose uptake and storage.'],
          ]
          const pick = cases[(i - 1) % cases.length]
          const [q, ans, diff2, exp] = pick
          questions.push(tf(makeId(subjectCode, t.code, i), q, ans, diff2, exp))
        }
      }

      if (t.code === 'plant') {
        if (type === 'mcq') {
          const q = i % 6
          if (q === 0) {
            const question = 'Photosynthesis equation (simplified) is:'
            const answer = '6CO2 + 6H2O -> C6H12O6 + 6O2'
            const options = shuffle([
              '6CO2 + 6H2O -> C6H12O6 + 6O2',
              'CO2 + H2O -> O2 + Glucose',
              'C6H12O6 + 6O2 -> 6CO2 + 6H2O',
              '2H2O + O2 -> 2H2 + O2',
            ]).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'This is the balanced overall equation for photosynthesis.'))
          } else if (q === 1) {
            const question = 'Which pigment is responsible for capturing light energy in plants?'
            const answer = 'Chlorophyll'
            const options = shuffle(['Hemoglobin', 'Chlorophyll', 'Melanin', 'Carotene']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'Chlorophyll absorbs light, mainly in the blue and red wavelengths.'))
          } else if (q === 2) {
            const question = 'Transpiration is the loss of water from plants mainly through:'
            const answer = 'Stomata'
            const options = shuffle(['Stomata', 'Xylem vessels', 'Phloem sieve tubes', 'Guard cells']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'Water vapor escapes through stomata.'))
          } else if (q === 3) {
            const question = 'Xylem transports mainly:'
            const answer = 'Water and minerals'
            const options = shuffle(['Water and minerals', 'Sugars', 'Oxygen', 'Hormones only']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'Xylem conducts water and dissolved mineral nutrients.'))
          } else if (q === 4) {
            const question = 'Phloem transports:'
            const answer = 'Sugars (food)'
            const options = shuffle(['Sugars (food)', 'Water', 'Proteins only', 'Minerals only']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'Phloem transports organic nutrients like sucrose.'))
          } else {
            const question = 'Which of the following is a plant hormone associated with cell elongation?'
            const answer = 'Auxin'
            const options = shuffle(['Auxin', 'Insulin', 'Epinephrine', 'Thyroxine']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'Auxins promote cell elongation and tropic responses.'))
          }
        } else {
          const cases = [
            ['Stomata are found on the leaves.', true, 'easy', 'Stomata allow gas exchange and transpiration.'],
            ['Xylem transports food in solution.', false, 'medium', 'Xylem mainly transports water/minerals.'],
            ['Phloem is responsible for transport of sugars.', true, 'easy', 'Phloem transports sugars.'],
            ['Transpiration increases when the stomata are closed.', false, 'easy', 'If closed, transpiration decreases.'],
            ['Plants need sunlight to perform photosynthesis.', true, 'easy', 'Photosynthesis depends on light energy.'],
            ['Chlorophyll is found in chloroplasts.', true, 'easy', 'Chloroplasts contain chlorophyll.'],
            ['Root hairs increase the surface area for absorption.', true, 'easy', 'Increases absorption.'],
            ['Auxin promotes apical dominance.', true, 'medium', 'Auxin helps maintain apical dominance.'],
            ['Gibberellins are generally associated with seed germination.', true, 'medium', 'Gibberellins help germination.'],
            ['In plants, oxygen is produced only in roots.', false, 'hard', 'Oxygen production occurs during photosynthesis in leaves/green parts.'],
          ]
          const pick = cases[(i - 1) % cases.length]
          const [q, ans, diff2, exp] = pick
          questions.push(tf(makeId(subjectCode, t.code, i), q, ans, diff2, exp))
        }
      }

      if (t.code === 'eco') {
        if (type === 'mcq') {
          const q = i % 5
          if (q === 0) {
            const question = 'In a food chain, grass typically acts as a:'
            const answer = 'Producer'
            const options = shuffle(['Producer', 'Consumer', 'Decomposer', 'Predator']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'Plants are producers because they photosynthesize.'))
          } else if (q === 1) {
            const question = 'A trophic level represents:'
            const answer = 'A feeding stage in a food chain'
            const options = shuffle(['A feeding stage in a food chain', 'A geographic location', 'Only the top predator', 'A type of habitat']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'Trophic level = feeding stage.'))
          } else if (q === 2) {
            const question = 'The carrying capacity (K) is the maximum:'
            const answer = 'Population size an environment can sustain'
            const options = shuffle(['Population size an environment can sustain', 'Average birth rate', 'Number of predators only', 'Minimum population size']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'Carrying capacity is the sustainable maximum population.'))
          } else if (q === 3) {
            const question = 'Carbon cycle mainly involves:'
            const answer = 'Photosynthesis and respiration'
            const options = shuffle(['Photosynthesis and respiration', 'Only evaporation', 'Only freezing', 'Only soil erosion']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'Plants take in CO2 via photosynthesis and organisms release it via respiration.'))
          } else {
            const question = 'If two species compete for the same limited resource, this is an example of:'
            const answer = 'Competition'
            const options = shuffle(['Competition', 'Mutualism', 'Parasitism', 'Commensalism']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'Competition occurs when species use the same limiting resource.'))
          }
        } else {
          const cases = [
            ['Decomposers help return nutrients to the environment.', true, 'easy', 'They break down dead matter.'],
            ['In a pyramid of numbers, the base is always the smallest.', false, 'medium', 'Usually producers at base are largest.'],
            ['Food chains show a one-way flow of energy.', true, 'medium', 'Energy flows through trophic levels.'],
            ['Population growth is always exponential without limits.', false, 'medium', 'Logistic growth occurs due to limiting factors.'],
            ['Biodiversity can increase ecosystem stability.', true, 'hard', 'More biodiversity can buffer against disturbances.'],
            ['Mutualism is when both species benefit.', true, 'easy', 'Definition.'],
            ['Parasitism harms the host and benefits the parasite.', true, 'easy', 'By definition.'],
            ['Commensalism benefits one species without affecting the other.', true, 'easy', 'Definition.'],
            ['Human activities can disrupt ecosystems.', true, 'medium', 'Yes.'],
            ['Extinction can occur when a species cannot adapt to environmental changes.', true, 'medium', 'Yes.'],
          ]
          const pick = cases[(i - 1) % cases.length]
          const [q, ans, diff2, exp] = pick
          questions.push(tf(makeId(subjectCode, t.code, i), q, ans, diff2, exp))
        }
      }

      if (t.code === 'micro') {
        if (type === 'mcq') {
          const q = i % 6
          if (q === 0) {
            const question = 'Bacteria are classified as:'
            const answer = 'Prokaryotes'
            const options = shuffle(['Prokaryotes', 'Eukaryotes', 'Viruses', 'Fungi']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'Bacteria are prokaryotic cells (no nucleus).'))
          } else if (q === 1) {
            const question = 'What is the main function of antibiotics?'
            const answer = 'Kill or inhibit bacterial growth'
            const options = shuffle(['Kill or inhibit bacterial growth', 'Kill viruses directly', 'Increase immunity only', 'Change blood types']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'Antibiotics target bacteria (cell wall, proteins, etc.).'))
          } else if (q === 2) {
            const question = 'A virus consists of:'
            const answer = 'Genetic material inside a protein coat'
            const options = shuffle(['Genetic material inside a protein coat', 'Only DNA', 'Only protein', 'Cells with organelles']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'Viruses have nucleic acid + protein capsid (and sometimes envelope).'))
          } else if (q === 3) {
            const question = 'Which part of a bacterium helps in movement?'
            const answer = 'Flagella'
            const options = shuffle(['Flagella', 'Ribosomes', 'Nucleus', 'Golgi apparatus']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'Flagella provide motility.'))
          } else if (q === 4) {
            const question = 'DNA replication in bacteria occurs in the:'
            const answer = 'Cytoplasm'
            const options = shuffle(['Cytoplasm', 'Nucleus', 'Mitochondria', 'Chloroplasts']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'Bacteria lack a nucleus; DNA processes occur in cytoplasm.'))
          } else {
            const question = 'Vaccines primarily train the immune system to:'
            const answer = 'Recognize and respond to pathogens'
            const options = shuffle(['Recognize and respond to pathogens', 'Destroy all antibodies', 'Stop all cell division', 'Replace blood cells']).slice(0, 4)
            questions.push(mcq(makeId(subjectCode, t.code, i), question, options, answer, difficulty, 'Vaccines stimulate immune memory for future protection.'))
          }
        } else {
          const cases = [
            ['Viruses are living organisms in the usual sense.', false, 'easy', 'Viruses are not true cells and require host cells.'],
            ['Antibiotics are effective against bacteria but not viruses.', true, 'easy', 'Antibiotics target bacterial processes.'],
            ['Bacteria have a cell wall (often containing peptidoglycan).', true, 'medium', 'Most bacteria have peptidoglycan.'],
            ['All bacteria cause disease.', false, 'easy', 'Many bacteria are harmless or beneficial.'],
            ['Vaccines reduce the chance of infection by building immunity.', true, 'medium', 'They help immune system prepare.'],
            ['Viruses can mutate over time.', true, 'medium', 'Mutation produces variation.'],
            ['Fungi are prokaryotes.', false, 'easy', 'Fungi are eukaryotes.'],
            ['Spore formation helps some bacteria survive harsh conditions.', true, 'hard', 'Endospores can resist adverse conditions.'],
            ['Hygiene and sanitation reduce the spread of microbes.', true, 'easy', 'Yes.'],
            ['Antibiotics should always be taken for the common cold.', false, 'hard', 'Common cold is viral; antibiotics do not help.'],
          ]
          const pick = cases[(i - 1) % cases.length]
          const [q, ans, diff2, exp] = pick
          questions.push(tf(makeId(subjectCode, t.code, i), q, ans, diff2, exp))
        }
      }
    }
    subject.topics.push({ name: t.name, questions })
  }

  return subject
}

function main() {
  const questions = {
    subjects: [buildMath(), buildPhysics(), buildChem(), buildBio()],
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(questions, null, 2), 'utf-8')
  console.log(`Generated question bank -> ${OUT_PATH}`)
}

main()

