let key = "SecretAlyaKey2026"
let keyLen = key.len
var s = newSeq[uint8](256)
for k in 0 ..< 256: s[k] = k.uint8
var j = 0
for i in 0 ..< 256:
  j = (j + s[i].int + ord(key[i mod keyLen])) mod 256
  swap(s[i], s[j])
var ii = 0
j = 0
var checksum: int64 = 0
for step in 0 ..< 100000:
  ii = (ii + 1) mod 256
  j = (j + s[ii].int) mod 256
  swap(s[ii], s[j])
  let streamByte = s[(s[ii].int + s[j].int) mod 256]
  let dataByte = ((step * 31) mod 256).uint8
  checksum += (dataByte xor streamByte).int64
echo checksum
