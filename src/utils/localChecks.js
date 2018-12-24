export const required = value => value ? undefined : 'Required';

export const nonEmpty = value => {
    if(value.trim() === ''){
        return 'Empty characters error message';
    }
    return undefined;
};

export const stringy = value => {
    return (typeof value === 'string')? undefined : "Input must be a string";
}

export const legitPassword = value => {
    if(value.length < 8 || value.length > 99){
        return 'Password must be between 8 and 99 characters long';
    }
    return undefined;
}