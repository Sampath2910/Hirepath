import json
import urllib.request
import urllib.error

BASE_URL = 'http://localhost:8080'

def post_json(path, payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        BASE_URL + path,
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        with urllib.request.urlopen(req) as resp:
            print(f'POST {path} status', resp.status)
            print(resp.read().decode())
    except urllib.error.HTTPError as e:
        print(f'POST {path} failed', e.code)
        print(e.read().decode())

if __name__ == '__main__':
    post_json('/api/users/register', {
        'name': 'Test User',
        'email': 'testuser@example.com',
        'passwordHash': 'password'
    })
    post_json('/api/jobs/scraped', {
        'title': 'Software Engineer',
        'company': 'HirePath Inc',
        'description': 'Develop cutting-edge Java and AI applications using Spring Boot, microservices, and cloud-native best practices.',
        'skillsRequired': 'Java, Spring Boot, AI, SQL, Microservices',
        'dedupHash': 'test-job-1'
    })
