const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

const options = {
    explorer: false,
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
        plugins: [
            {
                configActions: {
                    authorizeBtn: (originalPlugin) => (props) => {
                        const { authActions, authSelectors } = props;
                        return originalPlugin({
                            authActions,
                            authSelectors,
                            getComponent: props.getComponent,
                        });
                    },
                },
            },
        ],
    },
}

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
router.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Type', 'application/octet-stream')
    res.send(swaggerDocument)
})

module.exports = router;