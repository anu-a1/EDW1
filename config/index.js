import _ from 'lodash';

/* environment */
import development from './env/development';
import production from './env/production';
import staging from './env/staging';

const config = () => {
    const env = process.env.REACT_APP_ENV || process.env.NODE_ENV;

    console.log('You are running this application in "' + env + '" mode.');

    let config = _.merge({
        env,
        api: {url: 'http://localhost:3030'}
    }, {
        development, production, staging
    }[env]);

    console.log('config', config);

    return config;
};

export default config();
