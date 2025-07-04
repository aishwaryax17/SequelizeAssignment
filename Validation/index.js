const { celebrate, Joi } = require("celebrate");


exports.signupValidation = celebrate({
    body: Joi.object({
        name: Joi.string().min(3).max(20).required(),
        password: Joi.string().min(8).max(18).required(),
        age: Joi.number().integer().min(18).max(60).optional(),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    })
});



exports.loginValidation = celebrate({
    body: Joi.object({
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
        password: Joi.string().min(8).max(20).required(),
    })
});


exports.tokenValidation = celebrate({
    body: Joi.object({
        token: Joi.string().required()
    })
});

exports.tokenHeaderValidation = celebrate({
    headers: Joi.object({
        authorization: Joi.string().required(),
    }).unknown(true),
});

exports.userUpdateValidation = celebrate({
    headers:Joi.object({
       authorization:Joi.string().required(),
    }).unknown(true),
    params:Joi.object({
        id:Joi.number().integer().required(),
    }),
    body: Joi.object({
        name: Joi.string().min(3).max(20).optional(),
        password: Joi.string().min(8).max(18).optional(),
        age: Joi.number().integer().min(18).max(60).optional(),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).optional(),
        
    })
});
exports.userDeleteValidation = celebrate({
    headers:Joi.object({
       authorization:Joi.string().required(),
    }).unknown(true),
    params:Joi.object({
        id:Joi.number().integer().required(),
    })
    
});

exports.userDisplayValidation = celebrate({
    headers:Joi.object({
       authorization:Joi.string().required(),
    }).unknown(true),
    params:Joi.object({
        id:Joi.number().integer().required(),
    })
    
});


exports.getUserTasksValidation = celebrate({
  headers: Joi.object({
    authorization: Joi.string().required(),
  }).unknown(true),
  params: Joi.object({
    id: Joi.number().integer().required(),
  }),
});

exports.createTaskValidation=celebrate({
    body: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().optional(),
        completed: Joi.boolean().optional(),
        priority: Joi.string().optional(),
        userId:Joi.number().integer().optional(),
    })

});

exports.headerIdValidation= celebrate({
   
    params:Joi.object({
        id:Joi.number().integer().required(),
    })
    
});

exports.updateTaskValidation= celebrate({
   
    params:Joi.object({
        id:Joi.number().integer().required(),
    }),
    body: Joi.object({
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        completed: Joi.boolean().optional(),
        priority: Joi.string().optional(),
        userId:Joi.number().integer().optional(),
    })
    
});













