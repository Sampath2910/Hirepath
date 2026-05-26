from pathlib import Path

lines = []
lines.append('%PDF-1.4\n')
lines.append('1 0 obj << /Type /Catalog /Pages 2 0 R >>\nendobj\n')
lines.append('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n')
lines.append('3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n')
content = 'BT\n/F1 24 Tf\n72 720 Td\n(John Doe) Tj\nET\n'
lines.append(f'4 0 obj << /Length {len(content)} >>\nstream\n{content}endstream\nendobj\n')
lines.append('5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n')

pdf = b''.join([line.encode('latin1') for line in lines])
xref_offset = len(pdf)
xref = b'xref\n0 6\n0000000000 65535 f \n'
offset = 0
for line in lines:
    xref += f"{offset:010d} 00000 n \n".encode('latin1')
    offset += len(line.encode('latin1'))

trailer = f'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n'
pdf += xref + trailer.encode('latin1')

Path('dummy_resume.pdf').write_bytes(pdf)
print('created', Path('dummy_resume.pdf').resolve())
