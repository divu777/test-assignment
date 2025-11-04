import { useEffect, useState } from "react";
import axios from "axios";

const Admin = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [blueprint, setBlueprint] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

  const [name, setName] = useState("");
  const [logicalOperator, setLogicalOperator] = useState("and");
  const [conditions, setConditions] = useState<any[]>([]);
  const [thenActions, setThenActions] = useState<any[]>([]);
  const [elseActions, setElseActions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ruleRes = await axios.get("http://localhost:8081/api/rules");
        const bpRes = await axios.get("http://localhost:8081/api/blueprint");

        if (ruleRes.data.success) setRules(ruleRes.data.rules);
        if (bpRes.data.success) setBlueprint(bpRes.data.bluePrint);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const resetModal = () => {
    setName("");
    setConditions([{ field: "", operator: "eq", value: "" }]);
    setThenActions([{ field: "", property: {} }]);
    setElseActions([{ field: "", property: {} }]);
  };

  const openModal = (rule?: any) => {
    if (rule) {
      setEditingRule(rule);
      setName(rule.name);
      setConditions(rule.condition.conditions || []);
      setLogicalOperator(rule.condition?.operator || "and");

      setThenActions(rule.then || []);
      setElseActions(rule.else || []);
    } else {
      setEditingRule(null);
      resetModal();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRule(null);
    resetModal();
  };

  const handleSaveRule = async () => {
    if (!name.trim()) {
      alert("Please enter a rule name");
      return;
    }

    const newRule = {
      id: editingRule ? editingRule.id : Date.now(),
      name,
      condition: {
        operator: logicalOperator,
        conditions: conditions.filter((c) => c.field),
      },
      then: thenActions.filter((a) => a.field),
      else: elseActions.filter((a) => a.field),
    };

    const updatedRules = editingRule
      ? rules.map((r) => (r.id === editingRule.id ? newRule : r))
      : [...rules, newRule];

    try {
      const { data } = await axios.post(
        "http://localhost:8081/api/rules",
        updatedRules
      );
      if (data.success) {
        setRules(updatedRules);
        closeModal();
      }
    } catch (err) {
      console.error("Error saving rule:", err);
    }
  };

  const handleDeleteRule = async (id: number) => {
    const updated = rules.filter((r) => r.id !== id);
    try {
      const { data } = await axios.post(
        "http://localhost:8081/api/rules",
        updated
      );
      if (data.success) setRules(updated);
    } catch (err) {
      console.error("Error deleting rule:", err);
    }
  };

  const formatConditionDisplay = (condition: any) => {
    if (!condition) return "No conditions";

    const operator = condition.operator?.toUpperCase() || "AND";
    const conditions = condition.conditions || [];

    if (conditions.length === 0) return "No conditions";

    return conditions
      .map((c: any) => {
        const value = Array.isArray(c.value)
          ? `[${c.value.join(", ")}]`
          : c.value;
        return `${c.field} ${c.operator} ${value}`;
      })
      .join(` ${operator} `);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin - Rule Builder</h1>
        <button
          onClick={() => openModal()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          + New Rule
        </button>
      </div>

      {/* Rule List */}
      {rules.length === 0 ? (
        <p className="text-gray-500">No rules yet</p>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.id} className="border p-6 rounded-lg bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{rule.name}</h3>
                  <p className="text-gray-600 text-sm">
                    <strong>IF:</strong>{" "}
                    {formatConditionDisplay(rule.condition)}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <strong>THEN:</strong> {rule.then?.length || 0} action(s)
                  </p>
                  {rule.else && rule.else.length > 0 && (
                    <p className="text-gray-600 text-sm">
                      <strong>ELSE:</strong> {rule.else.length} action(s)
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(rule)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center overflow-y-auto z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full m-4">
            <h2 className="text-2xl font-bold mb-6">
              {editingRule ? "Edit Rule" : "Create New Rule"}
            </h2>

            {/* Rule Name */}
            <div className="mb-6">
              <label className="block font-semibold mb-2">Rule Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. Age check"
              />
            </div>

            {/* Conditions */}
            <div className="mb-6">
              <label className="block font-semibold mb-2">IF Conditions</label>

              <div className="mb-3">
                <label className="text-sm text-gray-600 mr-3">
                  Join conditions with:
                </label>
                <select
                  value={logicalOperator}
                  onChange={(e) => setLogicalOperator(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="and">AND (all must be true)</option>
                  <option value="or">OR (at least one must be true)</option>
                </select>
              </div>

              <div className="space-y-3">
                {conditions.map((cond, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <select
                      value={cond.field}
                      onChange={(e) => {
                        const newConds = [...conditions];
                        newConds[idx].field = e.target.value;
                        setConditions(newConds);
                      }}
                      className="border rounded px-3 py-2 flex-1"
                    >
                      <option value="">Select Field</option>
                      {blueprint.map((f: any) => (
                        <option key={f.field} value={f.field}>
                          {f.field}
                        </option>
                      ))}
                    </select>

                    <select
                      value={cond.operator}
                      onChange={(e) => {
                        const newConds = [...conditions];
                        newConds[idx].operator = e.target.value;
                        setConditions(newConds);
                      }}
                      className="border rounded px-3 py-2"
                    >
                      <option value="eq">equals</option>
                      <option value="ne">not equals</option>
                      <option value="gt">greater than</option>
                      <option value="lt">less than</option>
                      <option value="gte">≥</option>
                      <option value="lte">≤</option>
                      <option value="in">in array</option>
                    </select>

                    <input
                      type="text"
                      value={cond.value}
                      onChange={(e) => {
                        const newConds = [...conditions];
                        newConds[idx].value = e.target.value;
                        setConditions(newConds);
                      }}
                      className="border rounded px-3 py-2 flex-1"
                      placeholder="Value"
                    />

                    <button
                      onClick={() =>
                        setConditions(conditions.filter((_, i) => i !== idx))
                      }
                      className="bg-red-500 text-white px-3 py-2 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    setConditions([
                      ...conditions,
                      { field: "", operator: "eq", value: "" },
                    ])
                  }
                  className="text-blue-600 text-sm font-semibold"
                >
                  + Add Condition
                </button>
              </div>
            </div>

            {/* THEN Actions */}
            <div className="mb-6">
              <label className="block font-semibold mb-2">THEN Actions</label>
              <ActionBuilder
                actions={thenActions}
                setActions={setThenActions}
                blueprint={blueprint}
              />
            </div>

            {/* ELSE Actions */}
            <div className="mb-6">
              <label className="block font-semibold mb-2">
                ELSE Actions (Optional)
              </label>
              <ActionBuilder
                actions={elseActions}
                setActions={setElseActions}
                blueprint={blueprint}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRule}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ActionBuilder = ({ actions, setActions, blueprint }: any) => {
  return (
    <div className="space-y-3">
      {actions.map((action: any, idx: number) => (
        <div key={idx} className="flex gap-2 items-end">
          <select
            value={action.field}
            onChange={(e) => {
              const newActions = [...actions];
              newActions[idx].field = e.target.value;
              newActions[idx].property = {};

              setActions(newActions);
            }}
            className="border rounded px-3 py-2 flex-1"
          >
            <option value="">Select Field</option>
            {blueprint.map((f: any) => (
              <option key={f.field} value={f.field}>
                {f.field}
              </option>
            ))}
            <option value="setResult">Set Result</option>
          </select>

          {/* <input
            type='text'
            value={action.property?.value || ''}
            onChange={(e) => {
              const newActions = [...actions]
              newActions[idx].property = { value: e.target.value }
              setActions(newActions)
            }}
            className='border rounded px-3 py-2 flex-1'
            placeholder='Value or setting'
          /> */}

          {action.field && (
            <div className="space-y-2 ml-2">
              {action.field === "setResult" ? (
                <div>
                  <label className="text-sm text-gray-600">Result Value:</label>
                  <input
                    type="text"
                    value={action.property?.value || ""}
                    onChange={(e) => {
                      const newActions = [...actions];
                      newActions[idx].property = { value: e.target.value };
                      setActions(newActions);
                    }}
                    className="w-full border rounded px-3 py-2 mt-1"
                    placeholder="e.g. Approved, Rejected"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm text-gray-600">Value:</label>
                    <input
                      type="text"
                      value={action.property?.value || ""}
                      onChange={(e) => {
                        const newActions = [...actions];
                        newActions[idx].property = {
                          ...newActions[idx].property,
                          value: e.target.value,
                        };
                        setActions(newActions);
                      }}
                      className="w-full border rounded px-3 py-2 mt-1"
                      placeholder="Field value"
                    />
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={action.property?.display ?? true}
                        onChange={(e) => {
                          const newActions = [...actions];
                          newActions[idx].property = {
                            ...newActions[idx].property,
                            display: e.target.checked,
                          };
                          setActions(newActions);
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">Display</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={action.property?.require ?? false}
                        onChange={(e) => {
                          const newActions = [...actions];
                          newActions[idx].property = {
                            ...newActions[idx].property,
                            require: e.target.checked,
                          };
                          setActions(newActions);
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">Required</span>
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            onClick={() =>
              setActions(actions.filter((_: any, i: number) => i !== idx))
            }
            className="bg-red-500 text-white px-3 py-2 rounded"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={() => setActions([...actions, { field: "", property: {} }])}
        className="text-blue-600 text-sm font-semibold"
      >
        + Add Action
      </button>
    </div>
  );
};

export default Admin;
