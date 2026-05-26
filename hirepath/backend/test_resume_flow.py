import requests

BASE_URL = 'http://localhost:8080'
USER_ID = 35
JOB_ID = 172
PDF_PATH = 'sample_resume.pdf'

with open(PDF_PATH, 'rb') as f:
    files = {'file': ('sample_resume.pdf', f, 'application/pdf')}
    data = {'userId': str(USER_ID)}
    upload_resp = requests.post(f'{BASE_URL}/api/resumes/upload', files=files, data=data)
    print('upload status', upload_resp.status_code)
    print(upload_resp.text[:1000])


tailor_resp = requests.post(f'{BASE_URL}/api/resumes/tailor/{JOB_ID}', params={'userId': USER_ID})
print('tailor status', tailor_resp.status_code)
print(tailor_resp.text[:2000])
