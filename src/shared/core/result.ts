export class Result<T, E> {
    public isSuccess: boolean;
    private readonly _value?: T;
    private readonly _error?: E;

    private constructor(isSuccess: boolean, error?: E, value?: T) {
        this.isSuccess = isSuccess;
        this._value = value;
        this._error = error;
    }

    public static ok<U, F>(value?: U): Result<U, F> {
        return new Result<U, F>(true, undefined, value);
    }

    public static fail<U, F>(error?: F): Result<U, F> {
        return new Result<U, F>(false, error);
    }

    public getValue(): T {
        if (!this.isSuccess) throw new Error("Operación inválida: no se puede obtener el valor de un resultrado fallido");
        return this._value as T;
    }

    public getErrorValue():  E {
        if (this.isSuccess) throw new Error("Operación inválida: no se puede obtener el valor de un resultrado exitoso");
        return this._error as E;
    }
}