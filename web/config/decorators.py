import logging

from django.http import JsonResponse
from account.utils import decode_token
from account.models import CustomUser

def jwt_required(view_func):
    def _wrapped_view(request, *args, **kwargs):
        logging.info('check Authorizartion')
        token = request.headers.get('Authorization')
        if token is not None and token.startswith('Bearer '):
            token = token.split(' ')[1]
            logging.info(f'{token}')
            user_id = decode_token(token)
            logging.info(f'id: {user_id}')
            if user_id:
                try:
                    request.user = CustomUser.objects.get(id=user_id)
                    logging.info(f'{request.user.id}')
                    return view_func(request, *args, **kwargs)
                except CustomUser.DoesNotExist:
                    return JsonResponse({'error': 'Unauthorized'}, status=401)
        
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    return _wrapped_view