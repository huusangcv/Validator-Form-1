function validator (options) {
    var formElement = document.querySelector(options.form)
    var selectorRules = {}

    function getParent (element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    function validate (inputElement, rule, errorElement) {
        var errorMessage 

        //Handle rule
        let rules = selectorRules[rule.selector]
        for(var i = 0; i < rules.length; i++) {
            switch(inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'))
                    break
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            if(errorMessage){
                break
            }
        }

        //Check errorOfForm
        if(errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.getParentForm).classList.add('invalid')
        }else {
            errorElement.innerText = ''
            getParent(inputElement, options.getParentForm).classList.remove('invalid')
        }

        return !!errorMessage
    }
    
    if(formElement) {

        //SubmitForm
        formElement.onsubmit = (e) => {
            e.preventDefault()
            
            var isFormValid = false
            // Loop rules to get selector and test
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector)
                let errorElement = getParent(inputElement, options.getParentForm).querySelector(options.errorMessage)
                var isNotValid = validate(inputElement, rule, errorElement)

                if(!isNotValid) {
                    isFormValid = true
                }
            })

            if(isFormValid) {
                if(typeof options.onSubmit === 'function') {
                    var inputValues = formElement.querySelectorAll('input[name]')
                    var formValues = Array.from(inputValues).reduce( (values, input) => {
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="'+ input.name +'"]:checked').value
                                break
                            case 'checkbox':
                                if(!input.matches(':checked')) {
                                    values[input.name] = ''
                                    return values
                                }
                                if(!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break
                            case 'file':
                                values[input.name] = input.files
                                break
                            default:
                                values[input.name] = input.value
                            }
                        return values
                    }, {})

                }else{
                    console.log(`This is ${options.onSubmit} is not a function!`)
                }

                if(formValues) {
                    options.onSubmit(formValues)
                    formElement.reset()
                }else
                {
                    formElement.submit()
                    formElement.reset()
                }
            }
        }

        // Loop rules to get selector and test
        options.rules.forEach(function(rule) {
            
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            }else {
                selectorRules[rule.selector] = [rule.test]
            }

            //Create input 
            var inputElements = formElement.querySelectorAll(rule.selector)

            inputElements.forEach((inputElement) => {
                if(inputElement) {
                    let errorElement = getParent(inputElement, options.getParentForm).querySelector(options.errorMessage)
                    //Handle when user blur
                    inputElement.onblur = function () {
                        validate(inputElement, rule, errorElement)
                    }
    
                    //Handle when user input
                    inputElement.oninput = function () {
                        errorElement.innerText = ''
                        getParent(inputElement, options.getParentForm).classList.remove('invalid')
                    }
                }
            })
        })
    }
}

//Rule check user inputed
validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}

//One input is Email
validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Trường này phải là Email'
        }
    }
}

//One input is Passowrd
validator.minLength = function (selector, min) {
    return {
        selector: selector,
        test: function (value) {
          return value.length >= min ? undefined : `Mật khẩu phải từ ${min} kí tự`
        }
    }
}

//Confirm value
validator.isConfirmed = function (selector, getConfirm, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirm() ? undefined : message || 'Trường nhập lại không chính xác'
        }
    }
}