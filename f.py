import urllib.request

url = "https://www.google.com"
response = urllib.request.urlopen(url)
html = response.read().decode('utf-8')

print(html[:200])  # print first 200 characters of the page
