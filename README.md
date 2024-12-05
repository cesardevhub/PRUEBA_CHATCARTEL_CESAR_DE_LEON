# PRUEBA_CHATCARTEL_CESAR_DE_LEON

Desarrollo de APIs para gestionar la creación, lectura, actualización y eliminación de usuarios, proyectos y tareas.

## Tecnologías

- **NodeJs**
- **TypeScript**
- **MongoDB Atlas**
- **MySQL**
- **DigitalOcean**

## Dependencias

- **dotenv**
- **express**
- **morgan**
- **helmet**
- **cors**
- **mongoose**
- **typeorm**
- **bcrypt**
- **jsonwebtoken**

## Endpoints

**NOTA: si el usuario tiene que estar autenticado se debe enviar el token (generado en el login) en el campo Authorization en los headers**

### Usuarios

> POST http://68.183.29.160/user/auth/login

Verifica las credenciales del usuario y genera un token JWT. Por defecto se crea un superadmin por defecto al levantar el servidor

Body (JSON):

```
{
    "email": "",
    "password": "",
}
```

> POST http://68.183.29.160/user/new-account

Crear una cuenta. Se manejaron 3 roles: _superadmin_, _admin_, _user_ (Se espera que superadmin únicamente sea la cuenta que se crea por defecto).

Validaciones:

- El usuario tiene que estar logeado y ser de tipo admin o superadmin
- El superadmin puede crear cuentas de admin y de user
- El admin solo puede crear cuentas de USER
- Los únicos roles permitidos son _admin_ y _user_

Enviar en el body:

```
{
    "firstname": "",
    "lastname": "",
    "email": "",
    "password": "",
    "rol": ""
}
```

> GET http://68.183.29.160/user/get-info

Obtiene información de la cuenta logueada. El usuario tiene que estar autenticado. Se muestran los datos del usuario exceptuando la contraseña

> GET http://68.183.29.160/user/get-info/:userId

Obtiene información de un usuario en especìfico. El usuario tiene que estar autenticado y ser rol admin o super admin. Se muestran los datos del usuario exceptuando la contraseña

> GET http://68.183.29.160/user/get

Obtiene información de todos los usuario. El usuario tiene que estar autenticado y ser rol admin o super admin. Se muestran los datos del usuario exceptuando la contraseña

> GET http://68.183.29.160/user/get-tasks

Obtiene las tareas que tiene asignadas el usuario logeado. El usuario tiene que estar autenticado

> GET http://68.183.29.160/user/get-tasks/:userId

Obtiene las tareas que tiene asignadas un usuario en específico. El usuario tiene que estar autenticado y ser rol de admin o superadmin

> GET http://68.183.29.160/user/get-projects

Obtiene los projectos que tiene asignados el usuario logeado. El usuario tiene que estar autenticado

> GET http://68.183.29.160/user/get-projects/:userId

Obtiene los projectos que tiene asignados un usuario en específico. El usuario tiene que estar autenticado y ser rol de tipo admin o superadmin

> PUT http://68.183.29.160/user/update

Actualizar información del usuario logeado exceptuando el rol y validando si el correo a actualizar (si desea actualizar correo) no está en uso. El usuario tiene que estar autenticado.

Body (JSON):

```
{
    "firstname": "cesar",
    "lastname": "de leon",
    "email": "ejemplo"
    "password": "1234"
}
```

> PUT http://68.183.29.160/user/update/:userId

Actualizar información de un usuario en específico. El usuario tiene que estar autenticado

Validaciones:
    
    - Administradores solo pueden actualizar a usuario exceptuando el rol.
    - Superadmin puede actualizar a todos y a el exceptuando su propio rol.
    
Para ambos se valida que el correo a actualizar (si desea actualizar correo) no esté en uso. El usuario tiene que estar autenticado y ser de rol admin o superadmin.

Body (JSON):

```
{
    "firstname": "cesar",
    "lastname": "de leon",
    "email": "ejemplo"
    "password": "1234"
}
```

> DELETE http://68.183.29.160/user/delete/:userId

Eliminar un usuario en específico. El usuario tiene que estar autenticado y ser rol de tipo admin o superadmin

Validaciones:

- El admin no puede eliminar su cuenta, solo puede eliminar cuentas de user
- El superadmin puede eliminar a todos, menos a el

Las tareas asignadas de esta cuenta pasaran al usuario que tenga menos tareas en estado PENDIENTE en el proyecto, si no hay nadie más entonces pasaran al superadmin para que las reasigne

### Proyectos

> POST http://68.183.29.160/project/new

Crear una nueva tarea. El usuario tiene que estar autenticado y ser rol de tipo admin o superadmin

Body (JSON):

```
{
    "name": "projecto nuevo",
    "description": "Ejemplo de proyecto"
}
```

> GET http://68.183.29.160/project/get-tasks/:projectId

Obtener tareas de un proyecto en específico. El usuario tiene que estar autenticado y ser rol de tipo admin o superadmin

> GET http://68.183.29.160/project/get

Obtener todos los proyectos. El usuario tiene que estar autenticado y ser rol de tipo admin o superadmin

> PUT http://68.183.29.160/project/update/:projectId

Actualizar la información de un proyecto. El usuario tiene que estar autenticado y ser rol de tipo admin o superadmin

Body (JSON):

```
{
    "name": "projecto nuevo",
    "description": "Ejemplo de proyecto"
}
```

> DELETE http://68.183.29.160/project/delete/:projectId

Eliminr un proyecto junto a todas sus tareas. El usuario tiene que estar autenticado y ser rol de tipo admin o superadmin

### Tareas

> POST http://68.183.29.160/task/create

Crear una nueva tarea para un proyecto y asignarla a al usuario que tiene menos tareas en el proyecto. El usuario tiene que estar autenticado y ser rol de tipo admin o superadmin

Body (JSON):

```
{
    "name": "nueva tarea",
    "description": "nueva tarea para un trabajo de prueba",
    "projectId": 3,
    "rol":"user"
}
```

El campo "rol" es para especificar si necesita asignarla a un user o a un admin. Por defecto la tarea se crea con estado PENDING

> PUT http://68.183.29.160/task/update/:taskId

Actualizar una tarea. Puede asignarla a otro usuario o cambiar la información de la tarea. El usuario tiene que estar autenticado y ser rol de tipo admin o superadmin

Body (JSON):

```
{
    "name": "nueva tarea",
    "description": "nueva tarea para un trabajo de prueba",
    "userId": 3
}
```

> DELETE http://68.183.29.160/task/delete/:taskId

Eliminar una tarea. El usuario tiene que estar autenticado y ser rol de tipo admin o superadmin

### Logs

> GET http://68.183.29.160/log/get

Listar todos los logs de las actividades en fecha del más reciente al más antiguo. El usuario tiene que estar autenticado y ser rol de tipo admin o superadmin