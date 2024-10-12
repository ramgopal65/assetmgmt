# boorstrap
# hosted endpoints*:
/bootstrap/setting - clients are a. other services that need to access settings b. admin portal to manage settings
  - / (post - one or many settings, delete - one or many settings)
  - /count (get - all count)
  - /:sort&:select?:skip=skip&limit=limit (get - all per provided sort, select params and skip, limits as query params)
  - /:_id (get - one setting of id, put - one setting of id, delete - one setting of id)
  - /:applicationCode&:categoryCode&:property (get one setting of given applicationCode, categoryCodeand property)
  - /search/count (post - count as per the condition in body. sort, select, skip, limit also provided in body)
  - /search (post - settings as per the condition in body. sort, select, skip, limit also provided in body)
/bootstrap/application - clients are other services in the system, they login(to access settins)
  - / (get - all applications)
  - /:_id (get - one application of id)
  - /:code (get - one application of code)
  - /login (post - login the application)
/bootstrap/health - for operation supporrt
  - / (get - health of server)

*all above endpoints are for providing services to other microservices in this solution. not for external

# functions:
  - pilots db connection.
  - ingests the inputs from env and uses them appropriately
  - bootstrap hosts all confugurable parameters(aka settings) shaping the runtime behaviour of all microservices
  - bootstrap hosts an 'allowed' list of applications(microservices)that are part of this solution
  - bootstrap prepares the ground for this solution(from setup/provision). at first run(when there is no data) it creates
    - adminroles
    - creates default superadmin if none is available || logs in the provided superadmin given in env
      - all data crud operations by bootstrap app happens in the name of this superadmin
    - adds any new application(microservice)
    - adds any new settings && populates the settings needed for it to run
    - adds missing tracker features
    - adds missing tracker models


# business logic of provisioning:
  - reqs:
    - first time boot - no data in any collection
      - cross dependencies between models should be managed
    - createdBy should be filled for all documents in all collections for strict audit purposes
  - approach
    - any data created by bootstrap shall be done in the name of a default superadmin
    - the details(name, username, pwd, etc) of the default superadmin is provided thru env
    - once created, default superadmin cannot be deleted(to be implemented in admin ms)
    - operations can provide details of another superadmin in env. 
      - in this case bootstrap will use this superadmin's name for creating data if login is successful
      - if login fails, bootstrap shall abort. operations must ensure this does not happen
    - first run
      - step1 - bootstrap creates crudperms, adminroles, modulecrudperms. 
        - these are needed for creating default super admin
        - created in the name of God(createdBy = null)
      - step2 - bootstrap creates default super admin from details provided in env
      - step3 - bootstrap creates all other data(applications, settings, tracker features, tracker models. all in the name of default super admin. updates the createdBy of created crudperms, adminroles, modulecrudperms t odefault super admin
        - system is ready for usage
    - subsequent runs
      - bootstrap tries to login as default superadmin( or any other superadmin) using details provided in env
        - if login failure or not superadmin, bootstrap shall abort. operations must ensure this does not happen
        - if login success, proceed with start up of system

# need for 'require'ing modules in other microservices
  - purpose of bootstrap is to prepare the ground for other services to run. so bootstrap cannot wait to access the services of other services over rest(they are simply not running yet)
  
# some common implementation patterns related to the rest interfaces:
  - header parameters are used for authorization
  - for methods that support body(eg put, delete)
    - identity of single resource comes in req.param. all other details(sort, select, skip and limit) comes as part of body
      - sort would be a json
      - select would be a string
      - skip would be an integer
      - limit would be an integer
    - identity of multiple resource also comes in the form of an array called _ids in body
  - for methods that do not support body(eg get)
      - req.params are used to identify specific resource _id or sort/select or applicationCode/categoryCode/property 
      - req.query - query string parameters are used for fetch limit, skip, wherever needed

TODO:
1. mongodb operations - are they optimal?. 
2. Can we have more than one connection for a ms(to support read only and read write as needed)
3. Application login should not be allowed to modify settings. Only read
