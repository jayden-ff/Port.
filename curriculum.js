import { curriculumLocales } from './curriculum-locales.js';

// Stable routes, experiments and answer keys are shared by every language.
const base = {
  "topics": [
    {
      "id": "ai",
      "title": "Artificial intelligence",
      "description": "The science of learning, reasoning and representation."
    }
  ],
  "classes": [
    {
      "id": "foundations",
      "topicId": "ai",
      "number": "01",
      "title": "The foundations of intelligence",
      "short": "Mathematical foundations",
      "level": "Foundational",
      "time": "20 min",
      "color": "mint",
      "art": "orbit",
      "description": "Build the intuition. Then give it a mathematical language.",
      "prereq": "Curiosity and high-school algebra."
    },
    {
      "id": "machine-learning",
      "topicId": "ai",
      "number": "02",
      "title": "Machines that learn",
      "short": "Machine learning",
      "level": "Intermediate",
      "time": "20 min",
      "color": "peach",
      "art": "curve",
      "description": "From a first prediction to the mathematics of generalization.",
      "prereq": "Vectors, derivatives and basic probability."
    },
    {
      "id": "deep-learning",
      "topicId": "ai",
      "number": "03",
      "title": "Inside the neural network",
      "short": "Deep learning",
      "level": "Advanced",
      "time": "29 min",
      "color": "lavender",
      "art": "network",
      "description": "Follow the gradient. Understand attention. Read the research.",
      "prereq": "Linear algebra, the chain rule and statistical learning."
    }
  ],
  "lessons": [
    {
      "id": "prediction",
      "classId": "foundations",
      "title": "What does it mean to learn?",
      "subtitle": "From rules to representations",
      "minutes": 5,
      "experiment": "regression",
      "formula": "ŷ = wx + b     L = (1/n) Σᵢ (ŷᵢ − yᵢ)²",
      "questions": [
        {
          "prompt": "Which quantity does training change in a linear model?",
          "options": [
            "The observed targets",
            "The slope and intercept",
            "The definition of every future input"
          ],
          "correct": 1,
          "explanation": "Training adjusts model parameters. Inputs and targets are observations, not trainable parameters."
        },
        {
          "prompt": "For ŷ = 2x + 1 and x = 3, what is the prediction?",
          "correct": 7,
          "tolerance": 0,
          "explanation": "Substitute x = 3: 2 × 3 + 1 = 7. Prediction is the forward computation, before a loss is measured."
        }
      ],
      "sources": [
        [
          "Stanford CS229 · Machine Learning notes",
          "https://cs229.stanford.edu/main_notes.pdf"
        ]
      ]
    },
    {
      "id": "vectors",
      "classId": "foundations",
      "title": "Thinking in vectors",
      "subtitle": "The language of representations",
      "minutes": 5,
      "experiment": "neuron",
      "formula": "z = wᵀx + b     σ(z) = 1 / (1 + e⁻ᶻ)",
      "questions": [
        {
          "prompt": "Compute wᵀx for w = (2, −1) and x = (3, 4).",
          "correct": 2,
          "tolerance": 0,
          "explanation": "The dot product is 2 × 3 + (−1) × 4 = 2."
        },
        {
          "prompt": "X has shape 100 × 5. What shape must w have to produce one prediction per row?",
          "options": [
            "100 coordinates",
            "5 coordinates",
            "500 coordinates"
          ],
          "correct": 1,
          "explanation": "The inner dimensions must match: a 100 × 5 matrix times a 5-dimensional vector gives 100 outputs."
        }
      ],
      "sources": [
        [
          "Mathematics for Machine Learning · Deisenroth, Faisal & Ong",
          "https://mml-book.github.io/"
        ]
      ]
    },
    {
      "id": "probability",
      "classId": "foundations",
      "title": "Updating a belief",
      "subtitle": "Why the base rate matters",
      "minutes": 5,
      "experiment": "bayes",
      "formula": "P(H | E) = P(E | H) P(H) / P(E)",
      "questions": [
        {
          "prompt": "Among 90 true positives and 495 false positives, what percentage of positive results are true? Round to one decimal.",
          "correct": 15.4,
          "tolerance": 0.1,
          "explanation": "There are 585 positives in total. 100 × 90 / 585 ≈ 15.4%; sensitivity alone is not the answer."
        },
        {
          "prompt": "Which change increases the posterior for a fixed positive detector result?",
          "options": [
            "Lowering the prior prevalence",
            "Increasing the false-positive rate",
            "Increasing the prior prevalence"
          ],
          "correct": 2,
          "explanation": "With fixed sensitivity and false-positive rate, a higher prior raises the posterior odds."
        }
      ],
      "sources": [
        [
          "Mathematics for Machine Learning · Deisenroth, Faisal & Ong",
          "https://mml-book.github.io/"
        ],
        [
          "Stanford CS229 · Machine Learning notes",
          "https://cs229.stanford.edu/main_notes.pdf"
        ]
      ]
    },
    {
      "id": "derivatives",
      "classId": "foundations",
      "title": "The direction of improvement",
      "subtitle": "A derivative becomes a learning rule",
      "minutes": 5,
      "experiment": "gradient",
      "formula": "θₜ₊₁ = θₜ − η ∇L(θₜ)     L(θ) = θ²",
      "questions": [
        {
          "prompt": "Starting at θ = 4 with η = 0.25 and L = θ², what is θ after one step?",
          "correct": 2,
          "tolerance": 0,
          "explanation": "The gradient is 8. The update is 4 − 0.25 × 8 = 2."
        },
        {
          "prompt": "For L = θ² and nonzero θ, which fixed rate converges?",
          "options": [
            "η = 1.2",
            "η = 1",
            "η = 0.75"
          ],
          "correct": 2,
          "explanation": "Convergence requires |1 − 2η| < 1. At 0.75 the magnitude is halved on every update, with alternating sign."
        }
      ],
      "sources": [
        [
          "Mathematics for Machine Learning · Deisenroth, Faisal & Ong",
          "https://mml-book.github.io/"
        ],
        [
          "Deep Learning · Goodfellow, Bengio & Courville",
          "https://www.deeplearningbook.org/"
        ]
      ]
    },
    {
      "id": "regression",
      "classId": "machine-learning",
      "title": "Fitting is an optimization problem",
      "subtitle": "From residuals to normal equations",
      "minutes": 5,
      "experiment": "regression",
      "formula": "∇w L = (2/n) Xᵀ(Xw − y)     XᵀXw = Xᵀy",
      "questions": [
        {
          "prompt": "When is the unregularized least-squares coefficient vector unique?",
          "options": [
            "Whenever n is positive",
            "When X has full column rank",
            "When all target values differ"
          ],
          "correct": 1,
          "explanation": "Full column rank makes XᵀX positive definite, so the quadratic has a unique minimizer."
        },
        {
          "prompt": "For X = [1, 2]ᵀ and y = [2, 4]ᵀ with no intercept, solve the normal equation for w.",
          "correct": 2,
          "tolerance": 0,
          "explanation": "XᵀX = 5 and Xᵀy = 10. Hence 5w = 10 and w = 2."
        }
      ],
      "sources": [
        [
          "Stanford CS229 · Machine Learning notes",
          "https://cs229.stanford.edu/main_notes.pdf"
        ],
        [
          "Mathematics for Machine Learning · Deisenroth, Faisal & Ong",
          "https://mml-book.github.io/"
        ]
      ]
    },
    {
      "id": "classification",
      "classId": "machine-learning",
      "title": "From scores to probabilities",
      "subtitle": "Logistic regression and cross-entropy",
      "minutes": 5,
      "experiment": "neuron",
      "formula": "p = σ(wᵀx + b)     ℓ = −y log p − (1−y) log(1−p)",
      "questions": [
        {
          "prompt": "If p = 0.8 and y = 1, what is ∂ℓ/∂z for binary cross-entropy?",
          "correct": -0.2,
          "tolerance": 0.001,
          "explanation": "For the logistic model with cross-entropy, the logit gradient is p − y = −0.2."
        },
        {
          "prompt": "What does a well-calibrated probability of 0.8 mean?",
          "options": [
            "Every such prediction is correct",
            "About 80% of comparable predictions are positive",
            "The decision threshold must be 0.8"
          ],
          "correct": 1,
          "explanation": "Calibration concerns observed frequencies among comparable predicted probabilities, not certainty about any one event."
        }
      ],
      "sources": [
        [
          "Stanford CS229 · Machine Learning notes",
          "https://cs229.stanford.edu/main_notes.pdf"
        ],
        [
          "Guo et al. (2017) · On Calibration of Modern Neural Networks",
          "https://arxiv.org/abs/1706.04599"
        ]
      ]
    },
    {
      "id": "generalization",
      "classId": "machine-learning",
      "title": "The unseen-data problem",
      "subtitle": "Bias, variance and regularization",
      "minutes": 5,
      "experiment": "regularization",
      "formula": "Lλ(w) = ‖Xw − y‖²/n + λ‖w‖²",
      "questions": [
        {
          "prompt": "Where should λ be selected?",
          "options": [
            "On the final test set",
            "By minimizing training error alone",
            "Using training/validation splits or cross-validation"
          ],
          "correct": 2,
          "explanation": "Hyperparameters are part of model selection. The final test set must remain independent of that selection."
        },
        {
          "prompt": "For one feature with XᵀX/n = 2, Xᵀy/n = 6 and λ = 1, what is the ridge coefficient?",
          "correct": 2,
          "tolerance": 0,
          "explanation": "The ridge normal equation is (2 + 1)w = 6, so w = 2. Without the penalty the coefficient would be 3."
        }
      ],
      "sources": [
        [
          "Stanford CS229 · Machine Learning notes",
          "https://cs229.stanford.edu/main_notes.pdf"
        ],
        [
          "Deep Learning · Goodfellow, Bengio & Courville",
          "https://www.deeplearningbook.org/"
        ]
      ]
    },
    {
      "id": "evaluation",
      "classId": "machine-learning",
      "title": "Evidence, not just accuracy",
      "subtitle": "Designing a defensible evaluation",
      "minutes": 5,
      "experiment": "bayes",
      "formula": "precision = TP/(TP+FP)     recall = TP/(TP+FN)",
      "questions": [
        {
          "prompt": "A model produces TP = 40, FP = 10 and FN = 60. What is its recall as a percentage?",
          "correct": 40,
          "tolerance": 0,
          "explanation": "Recall is TP/(TP+FN) = 40/100 = 40%. Precision would be 40/50 = 80%."
        },
        {
          "prompt": "Two hundred records come from ten patients. Which bootstrap is generally better for patient-level generalization?",
          "options": [
            "Resample patients with their records",
            "Independently resample all records",
            "Reuse the training accuracy"
          ],
          "correct": 0,
          "explanation": "Resampling patients respects within-patient dependence. The appropriate unit follows the target population and sampling design."
        }
      ],
      "sources": [
        [
          "Stanford CS229 · Machine Learning notes",
          "https://cs229.stanford.edu/main_notes.pdf"
        ],
        [
          "Guo et al. (2017) · On Calibration of Modern Neural Networks",
          "https://arxiv.org/abs/1706.04599"
        ]
      ]
    },
    {
      "id": "neuron",
      "classId": "deep-learning",
      "title": "A neuron is a starting point",
      "subtitle": "Composition, features and expressivity",
      "minutes": 5,
      "experiment": "neuron",
      "formula": "h = φ(W₁x + b₁)     f(x) = W₂h + b₂",
      "questions": [
        {
          "prompt": "What does a stack of affine layers without nonlinearities represent?",
          "options": [
            "An arbitrary continuous function",
            "A single affine transformation",
            "A calibrated Bayesian posterior"
          ],
          "correct": 1,
          "explanation": "Composing affine maps produces another affine map. Nonlinear activations are what prevent the stack from collapsing this way."
        },
        {
          "prompt": "For ReLU(Wx+b), use W = 2, x = −3, b = 1. What is the output?",
          "correct": 0,
          "tolerance": 0,
          "explanation": "The preactivation is 2 × (−3) + 1 = −5. ReLU returns max(0, −5) = 0."
        }
      ],
      "sources": [
        [
          "Deep Learning · Goodfellow, Bengio & Courville",
          "https://www.deeplearningbook.org/"
        ]
      ]
    },
    {
      "id": "backprop",
      "classId": "deep-learning",
      "title": "Backpropagation, without the magic",
      "subtitle": "Reverse-mode automatic differentiation",
      "minutes": 5,
      "experiment": "gradient",
      "formula": "δₗ = (Wₗ₊₁ᵀδₗ₊₁) ⊙ φ′(zₗ)     ∂L/∂Wₗ = δₗhₗ₋₁ᵀ",
      "questions": [
        {
          "prompt": "A shared weight w appears twice: h = ReLU(wx), ŷ = wh, L = ½(ŷ − y)². At w = 2, x = 3 and y = 1, compute the total derivative dL/dw.",
          "correct": 132,
          "tolerance": 0,
          "explanation": "h = 6 and ŷ = 12. Both paths contribute: dŷ/dw = h + w × dh/dw = 6 + 2 × 3 = 12. Thus dL/dw = (12 − 1) × 12 = 132, not 66."
        },
        {
          "prompt": "A parameter reaches the loss through two branches. How are its gradient contributions combined?",
          "options": [
            "Multiply the contributions",
            "Use only the larger contribution",
            "Add the contributions"
          ],
          "correct": 2,
          "explanation": "The multivariable chain rule sums derivative contributions over all paths from the reused parameter to the loss."
        }
      ],
      "sources": [
        [
          "Deep Learning · Goodfellow, Bengio & Courville",
          "https://www.deeplearningbook.org/"
        ]
      ]
    },
    {
      "id": "attention",
      "classId": "deep-learning",
      "title": "Attention is a weighted conversation",
      "subtitle": "Queries, keys and values",
      "minutes": 9,
      "experiment": "attention",
      "formula": "Attention(Q,K,V) = softmax(QKᵀ / √dₖ) V",
      "questions": [
        {
          "prompt": "After dimension scaling, a query has logits [0, ln(3), ln(100)] and scalar values [2, 6, 100]. The third position is causally masked. Compute the attention output at temperature 1.",
          "correct": 5,
          "tolerance": 0.001,
          "explanation": "Apply the mask before softmax. The unmasked exponentials are 1 and 3, giving weights ¼ and ¾. The output is ¼ × 2 + ¾ × 6 = 5; the masked value contributes nothing."
        },
        {
          "prompt": "Why is the dot product divided by √dₖ?",
          "options": [
            "To keep logit scale roughly stable as key dimension grows",
            "To make attention linear in sequence length",
            "To guarantee causal explanations"
          ],
          "correct": 0,
          "explanation": "Under independent unit-variance coordinates, the dot-product variance grows as dₖ. Scaling counteracts that growth; it does not change quadratic pairwise structure."
        }
      ],
      "sources": [
        [
          "Vaswani et al. (2017) · Attention Is All You Need",
          "https://arxiv.org/abs/1706.03762"
        ],
        [
          "Deep Learning · Goodfellow, Bengio & Courville",
          "https://www.deeplearningbook.org/"
        ]
      ]
    },
    {
      "id": "research",
      "classId": "deep-learning",
      "title": "From learning a model to reading a paper",
      "subtitle": "Assumptions, limiting regimes and reproducibility",
      "minutes": 10,
      "experiment": "regularization",
      "formula": "Kθ(x,x′) = ∇θfθ(x)ᵀ ∇θfθ(x′)",
      "questions": [
        {
          "prompt": "Let f(a,b)(x) = a(bx)², with both a and b trainable. At a = 1 and b = 2, compute the neural tangent kernel K(1, 3).",
          "correct": 288,
          "tolerance": 0,
          "explanation": "The parameter gradient is (b²x², 2abx²) = (4x², 4x²). At x = 1 it is (4,4); at x = 3 it is (36,36). Their inner product is 4 × 36 + 4 × 36 = 288. Holding one parameter fixed would give a different kernel."
        },
        {
          "prompt": "What follows directly from an infinite-width fixed-kernel theorem?",
          "options": [
            "Every finite Transformer has a fixed training kernel",
            "The specified limit has the stated behavior under its assumptions",
            "Feature learning never occurs"
          ],
          "correct": 1,
          "explanation": "A theorem establishes its conclusion within its assumptions and limiting regime. Extending it to finite models requires additional evidence."
        }
      ],
      "sources": [
        [
          "Jacot et al. (2018) · Neural Tangent Kernel",
          "https://arxiv.org/abs/1806.07572"
        ],
        [
          "Deep Learning · Goodfellow, Bengio & Courville",
          "https://www.deeplearningbook.org/"
        ]
      ]
    }
  ]
};

export function getCurriculum(locale = 'en') {
  const language = String(locale).toLowerCase().split(/[-_]/)[0];
  const copy = curriculumLocales[language] || curriculumLocales.en;
  return {
    topics: base.topics.map(topic => ({ ...topic, ...copy.topics?.[topic.id] })),
    classes: base.classes.map(course => ({ ...course, levelKey: course.level, ...copy.classes?.[course.id] })),
    lessons: base.lessons.map(lesson => {
      const text = copy.lessons[lesson.id];
      return {
        ...lesson, ...text,
        sources: lesson.sources.map(source => [...source]),
        questions: lesson.questions.map((question, index) => ({
          ...question, ...text.questions?.[index],
          ...(question.options ? { options: [...(text.questions?.[index]?.options || question.options)] } : {})
        }))
      };
    })
  };
}

// Existing English imports remain compatible.
export const { topics, classes, lessons } = getCurriculum('en');
