function Validation(values) {

    let error = {}
    const email_pattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/
    //const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/

    if(values.name === "") {
        error.name = "Name should not be empty"
    }
    else {
        error.name = ""
    }
       
    if(values.email === "") {
        error.email = "Email should not be empty"
    }
    else if(!email_pattern.test(values.email)) {
        error.email = "Email didn't match"
    }
    else {
        error.email = ""
    }

    if(values.password === "") {
        error.password = "Password should not be empty"
    }
    else {
        error.password = ""
    }

    if(values.confirmPassword === "") {
        error.confirmPassword = "Please confirm your password"
    } else if(values.password !== values.confirmPassword) {
        error.confirmPassword = "Passwords do not match"
    } else {
        error.confirmPassword = ""
    }

    if(values.role === "") {
        error.role = "Role is required"
    } else {
        error.role = ""
    }

    return error;
}

export default Validation;
