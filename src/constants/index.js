import {Dimensions} from 'react-native';

var userId = 34;
export default {
    margin: 15,
    width: Dimensions.get('window').width,
    url: {
        'base': 'https://api-dev.superble.com/api/v1/',
        'base2': 'https://api-staging.superble.com/api/v1/',
        'base1': 'https://api.superble.com/api/v1/',
        'user_topics': 'profiles/${userId}/get_topics',
        'profiles_topics': 'profiles/524/get_topics',
        'liked_topics_detail': 'profiles/524/get_products',
        'user_profiles': 'profiles/524/info',
        'update_user_profile': 'profiles/524',
        'topics_signup': 'categories/topics',
        'add_topics': 'categories/follow',
        'save_images': 'products/create_draft_with_images',
        'pinterest_images': 'social_integrations/get_pinterest_images',
        'get_search_products': 'search/auto_suggest'
      


    }
}
