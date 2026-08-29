// variable en JavaScript
// VAR LET CONST
var nombre = 'luis';
var edad = 44;
// VAR no se usa nunca


//LET se puede modificar el valor de la vatiable declarada
let ciudad = 'viña';

ciudad = 'quilpue';

//CONST se usa en variables que no deben de cambiar
const email = 'test@test.cl';

//creacion de objetos
const data =  {
    edad: 20,
    nombre: 'luis',
    ciudad: 'quilpue',
    direccion: {
        calle:  '',
        ciudad: '',
        region:{
            codigo: 1,
            nombre: ''
        }
    }
};


//tipos de datos
const data2 =[
    'hola', 'hadas', 'dasd', 2.2, 4, 10, {hola: 'hola'}
];

//crear funcion
function nombreFuncion(nombre){
}

function imprimirNombre(nombre){
    console.log ('Tu nombre es:'+ nombre)
}

imprimirNombre('Isaac');


//sumr dos numeros 
function sumarDosNumeros(num1, num2) {
    return num1 + num2;
}
console.log(sumarDosNumeros(100,200));

//calcular promedio de 3 notas
//Agregar si el promedio es inferior a 4 = "reprobado" y si es mayor a 4 "Aprobado"

function promedio(num1, num2, num3){
    let promedio = (num1 + num2 + num3) / 3;

    if (promedio < 4 ){           // el IF se reemplaza por ? y el else :
        console.log('Reprobado');
    }else{
        console.log('Aprobado')
    }
    
    return promedio

}
    console.log('Promedio ' + promedio(4.0, 5.3, 7.0));

//
let variable1 = 2;
let variable2 = "2";

if (variable1 === variable2){
    console.log('hola estoy dentro del if');
}