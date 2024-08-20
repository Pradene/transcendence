from django.http import JsonResponse
from account.utils.token import decode_token
from account.models import CustomUser

def jwt_required(view_func):
    def _wrapped_view(request, *args, **kwargs):
        token = request.headers.get('Authorization')
        
        if token is not None and token.startswith('Bearer '):
            token = token.split(' ')[1]
            user_id = decode_token(token)
            
            if user_id:
                try:
                    request.user = CustomUser.objects.get(id=user_id)
                    return view_func(request, *args, **kwargs)
                except CustomUser.DoesNotExist:
                    return JsonResponse({'error': 'Unauthorized'}, status=401)
        
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    return _wrapped_view