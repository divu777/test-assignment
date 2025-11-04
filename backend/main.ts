import express from "express";
import cors from "cors";
import fs from "fs";
import path from 'path';
const app = express();

app.use(express.json());
app.use(cors());

const Rules = [
  {
    id: 1,
    name: "Branching example (with else)",
    condition:{
      operator:'or',
      conditions:[
      {
        field: "recordType",
        operator: "eq",
        value: "SpecialCase",
      },
      {
        field: "riskScore",
        operator: "gt",
        value: 50,
      },
    ]
    },
    then: [
      {
        field: "setResult",
        property: {
          value: "Specialist Review",
        },
      },
      {
        field: "reviewNotes",
        property: {
          display: true,
        },
      },
      {
        field: "reviewNotes",
        property: {
          require: true,
        },
      },
    ],
    else: [
      {
        field: "setResult",
        property: {
          value: "General Review",
        },
      },
      {
        field: "reviewNotes",
        property: {
          display: false,
        },
      },
      {
        field: "reviewNotes",
        property: {
          require: false,
        },
      },
    ],
  },
  {
    name: "Expiry gurard",
    id: 2,
     condition:{
      operator:'and',
    conditions: [
      {
        field: "expiryDate",
        operator: "lt",
        value: new Date().toISOString().split('T')[0],
      },
    ],
  },
    then: [
      {
        field: "reviewNotes",
        property: {
          require: true,
        },
      },
      {
        field: "expiryStatus",
        property: {
          value: "Expired",
        },
      },
    ],
    else: [
      {
        field: "expiryStatus",
        property: {
          value: "Valid",
        },
      },
    ],
  },
  {
    id: 3,
    name: "Simple overrride",
     condition:{
      operator:'and',
    conditions: [
      {
        field: "region",
        operator: "in",
        value: ["EU", "UK"],
      },
    ],
  },
    then: [
      {
        field: "setResult",
        property:{

          value: "Compliance Review",
        }
      },
    ],
  },
];

const BluePrint = [
  {
    field: "name",
    type: "text",
  },
  {
    field: "recordType",
    type: "select",
    options: ["General", "SpecialCase"],
  },
  {
    field: "riskScore",
    type: "number",
    min: 0,
    max: 100,
  },
  {
    field: "expiryDate",
    type: "date",
  },
  {
    field: "region",
    type: "select",
    options: ["US", "EU", "UK"],
  },
  {
    field: "reviewNotes",
    type: "text",
  },
  {
    field: "expiryStatus",
    type: "display",
  },
];

if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

const rulesPath = path.join(__dirname,'data','/rules.json')
const blueprintPath =path.join( __dirname,'data','/blueprint.json')
if(!fs.existsSync(rulesPath)){
    fs.writeFileSync(rulesPath,JSON.stringify(Rules))
}

if(!fs.existsSync(blueprintPath)){
    fs.writeFileSync(blueprintPath,JSON.stringify(BluePrint))
}







app.get("/api/rules", (req, res) => {
  try {

    const data = JSON.parse(fs.readFileSync(rulesPath,'utf-8'))
    res.json(
        {
            rules:data
            , success:true
        }
    ) 

  } catch (error) {
    console.log("Error in getting rules, :" + error);
    res.json({
      message: "Error in getting rules.",
      success: false,
    });
  }
});

app.post("/api/rules", (req, res) => {
  try {
    const newRules = req.body
    fs.writeFileSync(rulesPath,JSON.stringify(newRules))
    res.json({
      message:"rules updated",
      success:true
    })
  } catch (error) {
    console.log("Error in adding the new rule, :" + error);
    res.json({
      message: "Error in adding rule",
      success: false,
    });
  }
});

app.get("/api/blueprint", (req, res) => {
  try {

    const data = JSON.parse(fs.readFileSync(blueprintPath,'utf-8'))
    res.json(
        {
            bluePrint:data,
            success:true
        }
    ) 
  } catch (error) {
    console.log("Error in getting the blueprint, :" + error);
    res.json({
      message: "Error in getting the blueprint",
      success: false,
    });
  }
});


const evaluateCondition = (condition: any, data: any): boolean => {
  const { field, operator, value } = condition;
  const fieldValue = data[field];

  if (fieldValue === '' || fieldValue === null || fieldValue === undefined) {
    return false;
  }

  const left = fieldValue;
  const right = value;

  switch (operator) {
     case 'eq':
      return String(left) === String(right);
    case 'ne':
      return String(left) !== String(right);
    case 'gt':
      return left > right;
    case 'gte':
      return left >= right;
    case 'lt':
      return left < right;
    case 'lte':
      return left <= right;
    case 'in':
      if (!Array.isArray(value)) return false;
      return value.map(String).includes(String(fieldValue));
    default:
      return false;
  }
};

const evaluateRuleCondition = (condition: any, data: any): boolean => {
  if (condition.field) {
    return evaluateCondition(condition, data);
  }
  const operator = (condition.operator || 'and').toLowerCase();

  const conditions = Array.isArray(condition.conditions) ? condition.conditions : [];
  if (conditions.length === 0) return true;

  switch (operator.toLowerCase()) {
    case 'and':
      return conditions.every((c:any) => evaluateRuleCondition(c, data));
    case 'or':
      return conditions.some((c:any) => evaluateRuleCondition(c, data));
    default:
      return false;
  }
};


const evaluteRules = (data:any,rules:any)=>{
  const initial:any = {
    'result':'Pending'
  }
  BluePrint.forEach((ele)=>{
    initial[ele.field]={
      display:true,
      require:false,
      value:data[ele.field] || ''
    }
  })

  rules.forEach((rule:any)=>{

    const conditons = rule['condition']

    //  const allConditionsTrue = conditons.every((condition: any) => {
    //   return evaluateCondition(condition, data);
    // });

    const allConditionsTrue = evaluateRuleCondition(conditons,data)

    if(allConditionsTrue){
                  if (rule.then && rule.then.length > 0) {
                  
      rule.then.forEach((action:any)=>{

        if(action.field==='setResult'){
            initial['result'] = action.property?.value || action.value;
        }else{

          initial[action.field]={
            ...initial[action.field],
            ...action.property
          }
        }
      })
    }
    }else{
            if (rule.else && rule.else.length > 0) {
            
      rule.else.forEach((action:any)=>{
        if (action.field === 'setResult') {
            initial['result'] = action.property?.value || action.value;
          } else {
            initial[action.field] = {
              ...initial[action.field],
              ...action.property
            };
          }
      })
    }
    }

  })


  return initial

  
}

app.post("/api/evaluate", (req, res) => {
    try {
      const { data} = req.body

      const rules = JSON.parse(fs.readFileSync(rulesPath,'utf-8'))
      const check =evaluteRules(data,rules)

      res.json({
      success: true,
      result:check.result || 'Pending',
      fields:check
    });
        
    } catch (error) {
        console.log("Error in evaluting form, :"+error)
        res.json({
            message:'Error in evaluting form, please try again later',
            success:false
        })
    }
});

app.listen(8081, () => {
  console.log("listening on port now ");
});
