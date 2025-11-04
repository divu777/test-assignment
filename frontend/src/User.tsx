import axios from 'axios'
import  { useCallback, useEffect, useState } from 'react'

const User = () => {
    const [bluePrint, setBlueprint] = useState<any[] | null>(null)
    const [error, setError] = useState(false)
    const [formData, setFormData] = useState<Record<string, any>>({})
    const [evaluation, setEvaluation] = useState<any>(null)
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

    const fetchBlueprint = useCallback(async () => {
        try {
            const { data } = await axios.get(`http://localhost:8081/api/blueprint`)
            if (!data.success) {
                setError(true)
            } else {
                setBlueprint(data.bluePrint)
                const initialData: Record<string, any> = {}
                data.bluePrint.forEach((field: any) => {
                    initialData[field.field] = ''
                })
                setFormData(initialData)
            }
        } catch (err) {
            console.error('Error fetching blueprint:', err)
            setError(true)
        }
    }, [])



    useEffect(() => {
        fetchBlueprint()
    }, [])

    const handleInputChange = (fieldName: string, value: any) => {
        const newFormData = {
            ...formData,
            [fieldName]: value
        }
        setFormData(newFormData)
        evaluateForm(newFormData)
    }

    const evaluateForm = async (data: Record<string, any>) => {
        try {
            const { data: responseData } = await axios.post(`http://localhost:8081/api/evaluate`, {
                data: data
            })
            if (responseData.success) {
                setEvaluation(responseData)
            }
        } catch (err) {
            console.error('Error evaluating form:', err)
        }
    }

    const handleSubmit = () => {
        if (!evaluation) return;

        const errors: Record<string, string> = {}
        bluePrint?.forEach(field => {
            const fieldConfig = evaluation.fields?.[field.field]
            if (fieldConfig?.require && !formData[field.field]) {
                errors[field.field] = `${field.field} is required`
            }
        })

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            return
        }

        alert(`form submitted successfully!\nResult: ${evaluation.result}`)
    }

    if (error) {
        return (
            <div className='flex w-screen h-screen bg-black/50 items-center justify-center'>
                <div className='w-56 h-56 flex items-center justify-center bg-white text-red-500 text-center'>
                    <h1>Error in getting the blueprint, try again later</h1>
                </div>
            </div>
        )
    }


    return (
        <div className='p-8 max-w-2xl mx-auto'>
            <h1 className='text-3xl font-bold mb-2'>Application Form</h1>

            {evaluation && (
                <div className='mb-8 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg'>
                    <p className='text-sm opacity-90'>Current Evaluation</p>
                    <p className='text-2xl font-bold'>{evaluation.result || 'Pending'}</p>
                </div>
            )}

            <div className='space-y-4 bg-gray-50 p-6 rounded-lg border'>
                {bluePrint && bluePrint.map((field: any, idx: number) => {
                    const fieldConfig = evaluation?.fields?.[field.field]
                    if (fieldConfig?.display === false) {
                        return null
                    }

                    const isRequired = fieldConfig?.require || false
                    const validationError = validationErrors[field.field]
                    const displayValue = fieldConfig?.value || formData[field.field] || ''

                    if (field.type === 'text') {
                        return (
                            <div key={idx} className='flex flex-col'>
                                <label className='font-semibold mb-2'>
                                    {field.field}
                                    {isRequired && <span className='text-red-500 ml-1'>*</span>}
                                </label>
                                <input
                                    type='text'
                                    value={displayValue}
                                    onChange={(e) => handleInputChange(field.field, e.target.value)}
                                    className={`border rounded px-3 py-2 ${
                                        validationError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder={`Enter ${field.field}`}
                                />
                                {validationError && (
                                    <p className='text-red-500 text-sm mt-1'>{validationError}</p>
                                )}
                            </div>
                        )
                    }

                    // Number input
                    if (field.type === 'number') {
                        return (
                            <div key={idx} className='flex flex-col'>
                                <label className='font-semibold mb-2'>
                                    {field.field}
                                    {isRequired && <span className='text-red-500 ml-1'>*</span>}
                                </label>
                                <input
                                    type='number'
                                    min={field.min || 0}
                                    max={field.max || 100}
                                    value={displayValue}
                                    onChange={(e) => handleInputChange(field.field, e.target.value)}
                                    className={`border rounded px-3 py-2 ${
                                        validationError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder={`Enter ${field.field}`}
                                />
                                {validationError && (
                                    <p className='text-red-500 text-sm mt-1'>{validationError}</p>
                                )}
                            </div>
                        )
                    }

                    // Select dropdown
                    if (field.type === 'select') {
                        return (
                            <div key={idx} className='flex flex-col'>
                                <label className='font-semibold mb-2'>
                                    {field.field}
                                    {isRequired && <span className='text-red-500 ml-1'>*</span>}
                                </label>
                                <select
                                    value={displayValue}
                                    onChange={(e) => handleInputChange(field.field, e.target.value)}
                                    className={`border rounded px-3 py-2 ${
                                        validationError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                >
                                    <option value=''>Select {field.field}</option>
                                    {field.options && field.options.map((opt: string, optIdx: number) => (
                                        <option key={optIdx} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                {validationError && (
                                    <p className='text-red-500 text-sm mt-1'>{validationError}</p>
                                )}
                            </div>
                        )
                    }

                    // Date input
                    if (field.type === 'date') {
                        return (
                            <div key={idx} className='flex flex-col'>
                                <label className='font-semibold mb-2'>
                                    {field.field}
                                    {isRequired && <span className='text-red-500 ml-1'>*</span>}
                                </label>
                                <input
                                    type='date'
                                    value={displayValue}
                                    onChange={(e) => handleInputChange(field.field, e.target.value)}
                                    className={`border rounded px-3 py-2 ${
                                        validationError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                />
                                {validationError && (
                                    <p className='text-red-500 text-sm mt-1'>{validationError}</p>
                                )}
                            </div>
                        )
                    }

                    // Display field (read-only, shows computed values)
                    if (field.type === 'display') {
                        return (
                            <div key={idx} className='flex flex-col'>
                                <label className='font-semibold mb-2'>{field.field}</label>
                                <div className='bg-white border border-gray-300 rounded px-3 py-2 text-gray-700 font-semibold'>
                                    {displayValue || '—'}
                                </div>
                            </div>
                        )
                    }

                    return null
                })}
            </div>

            <button
                onClick={handleSubmit}
                className='mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded'
            >
                Submit Application
            </button>
        </div>
    )
}

export default User