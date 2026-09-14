#include <stdio.h>
#include <stdlib.h>

typedef struct ListNode {
    long long val;
    struct ListNode *next;
} ListNode;

int main() {
    long long count = 50000;
    ListNode *head = NULL;
    for (long long i = 0; i < count; i++) {
        ListNode *node = (ListNode *)malloc(sizeof(ListNode));
        node->val = i;
        node->next = head;
        head = node;
    }

    long long sum = 0;
    ListNode *cur = head;
    while (cur != NULL) {
        sum += cur->val;
        ListNode *tmp = cur;
        cur = cur->next;
        free(tmp);
    }
    printf("%lld\n", sum);
    return 0;
}
