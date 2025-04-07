# backend/core/middleware.py

class DomainRoutingMiddleware:
    """
    Simplified middleware without any redirects
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Simply pass the request through without any routing logic
        response = self.get_response(request)
        return response