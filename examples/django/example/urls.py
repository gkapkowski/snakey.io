from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    #url(r'', 'example.views.main_view', name='main'),
    url(r'', 'example.views.random_view', name='random'),
)
